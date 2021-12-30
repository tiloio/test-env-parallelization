import { createResource } from "./create-resource.ts";
import { DefaultOutput, ResourceInstance } from "./resource.ts";

export const createResources = async <T extends DefaultOutput>(
  resources: ResourceInstance<T>[],
  workerId?: number,
) =>
  await Promise.all(
    resources.map((resource) => createResource(resource, workerId)),
  );
