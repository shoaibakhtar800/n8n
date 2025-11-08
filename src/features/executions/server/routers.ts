import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const executionsRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        workflowId: z.string(),
        data: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, workflowId, data } = input;

      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The 'id' parameter is required to update an execution.",
        });
      }

      return await prisma.$transaction(async (tx) => {
        await tx.node.update({
          where: {
            id: id,
            workflowId: workflowId,
          },
          data: {
            data: data || {},
          },
        });

        await tx.workflow.update({
          where: {
            id: workflowId,
            userId: ctx.auth.user.id,
          },
          data: {
            updatedAt: new Date(),
          },
        });
        
        const workflow = await prisma.workflow.findUniqueOrThrow({
          where: { id: workflowId, userId: ctx.auth.user.id },
        });

        return workflow;
      });
    }),
});
