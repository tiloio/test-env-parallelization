import { createOrReturnTempFile } from "./create-or-return-temp-file.ts";
import { CreatorFn, DefaultCratorOutputData, Resource } from "./resource.ts";

let cache: { [key: string]: any } = {};

export const createResource = async <T extends DefaultCratorOutputData>(
  resource: Resource<T>,
  workerId?: string
): Promise<T> => {
  const resourceName = workerId
    ? `${resource.name}_${workerId}`
    : resource.name;
  const createResult =
    cache[resourceName] ?? (await create(resourceName, resource.creatorFn));

  return await resource.initializationFn(createResult);
};

export const clearCache = () => (cache = {});

const create = async (name: string, creatorFn: CreatorFn) => {
  const createResult = await createOrReturnTempFile({ name, creatorFn });
  cache[name] = createResult ?? true;
  return createResult;
};
