import { createResource } from "./create-resource.ts";
import { Resource } from "./resource.ts";

export const createResources = async (
  resources: Resource[],
  workerId?: string
) =>
  await Promise.all(
    resources.map((resource) => createResource(resource, workerId))
  );
