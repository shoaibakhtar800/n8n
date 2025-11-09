import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";
import { httpRequestChannel } from "@/inngest/channels/http-request";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(stringified);

  return safeString;
});

type HttpRequestData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  try {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "loading",
      })
    );

    const result = await step.run("http-request", async () => {
      if (!data.endpoint) {
        throw new NonRetriableError(
          `HTTP Request node (${nodeId}) is not configured with an endpoint.`
        );
      }

      if (!data.variableName) {
        throw new NonRetriableError(
          "HTTP Request node is missing variable name."
        );
      }

      if (!data.method) {
        throw new NonRetriableError(
          "HTTP Request node is missing HTTP method."
        );
      }

      let endpoint: string;
      const template = Handlebars.compile(data.endpoint);
      endpoint = template(context);

      if (!endpoint || typeof endpoint !== "string") {
        throw new NonRetriableError(
          "HTTP Request node generated an invalid endpoint."
        );
      }

      const method = data.method;
      const options: KyOptions = { method };

      if (["POST", "PUT", "PATCH"].includes(method)) {
        const resolved = Handlebars.compile(data.body || "{}")(context);
        JSON.parse(resolved); // Validate JSON
        options.body = resolved;
        options.headers = {
          "Content-Type": "application/json",
        };
      }

      const response = await ky(endpoint, options);
      const contentType = response.headers.get("content-type");
      const responseBody = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      const responsePayload = {
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          data: responseBody,
        },
      };

      return {
        ...context,
        [data.variableName]: responsePayload,
      };
    });

    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "success",
      })
    );

    return result;
  } catch (error) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw error;
  }
};
