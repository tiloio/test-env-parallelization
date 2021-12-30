import { createOrReturnTempFile } from "./create-or-return-temp-file.ts";
import {
  DefaultOutput,
  ResourceCreateFn,
  ResourceInstance,
} from "./resource.ts";

let cache: { [key: string]: any } = {};

export const createResource = async <T extends DefaultOutput>(
  resource: ResourceInstance<T>,
  workerId?: number,
): Promise<T> => {
  const resourceName = workerId
    ? `${resource.name}_${workerId}`
    : resource.name;
  const createResult = cache[resourceName] ??
    (await create(resourceName, resource.create, workerId));

  return await resource.init(createResult);
};

export const clearCache = () => (cache = {});

const create = async (
  name: string,
  creatorFn: ResourceCreateFn,
  workerId = 0,
) => {
  const createResult = await createOrReturnTempFile({
    name,
    creatorFn: () => creatorFn({ workerId }),
  });
  cache[name] = createResult ?? true;
  return createResult;
};
