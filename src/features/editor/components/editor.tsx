"use client";

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";

export const EditorLoading = () => {
  return <LoadingView message="Almost there! Preparing the editor..." />;
};

export const EditorError = () => {
  return (
    <ErrorView message="Oops! We couldn’t load the editor. Try reloading the page." />
  );
};

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);

  return <p>{JSON.stringify(workflow, null, 2)}</p>;
};
