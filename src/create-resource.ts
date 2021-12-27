import { Resource } from "./resource.ts";

let cache: { [key: string]: any } = {};

export const createResource = async (resource: Resource) => {
  const createResult = cache[resource.name] ?? (await create(resource));

  return await resource.initializationFn(createResult);
};

export const clearCache = () => (cache = {});

const create = async (resource: Resource) => {
  const createResult = await resource.creatorFn();
  cache[resource.name] = createResult ?? true;
  return createResult;
};
