type JSONObject =
  | string
  | number
  | boolean
  | null
  | JSONObject[]
  | { [key: string]: JSONObject };
export type DefaultOutput = JSONObject;

export type CreateFnOutput<
  Data extends DefaultOutput = DefaultOutput,
> = {
  path: string;
  data: Data;
  created: boolean;
  createdTimestamp: number;
};

export type ResourceCreateFnWithoutOption<
  CreateOutput extends DefaultOutput = DefaultOutput,
> = () => Promise<CreateFnOutput<CreateOutput>>;

export type ResourceCreateFn<
  CreateOutput extends DefaultOutput = DefaultOutput,
> = (option: { workerId: number }) => Promise<CreateFnOutput<CreateOutput>>;

type ResourceInitFn<
  CreateOutput extends CreateFnOutput,
  Output extends DefaultOutput,
> = (creatorOutput: CreateOutput) => Promise<Output>;

/**
 * create: Is only called once for all processes.
 * init: Is called in each process with the output of the create function. The result of the create function is cached.
 */
export type ResourceInstance<
  Output extends DefaultOutput,
  CreateOutput extends CreateFnOutput = CreateFnOutput,
> = {
  name: string;
  create: ResourceCreateFn<CreateOutput>;
  init: ResourceInitFn<CreateOutput, Output>;
};

/**
 * Represents a Resource which can be create via module:./create-resource.ts:createResource or createResources.
 * @constructor
 * @param {string} name - The name of the resource to identify it.
 * @param {Function} create - The function to create the resource. This is called once overall processes. The result of it is saved in the temp directory and read by all other processes. The result is cached in a process if it was already read.
 * @param {Function} [init] - The optional function to initialize the resource. This function would be called for each createResource or createResources call. The result is never cached.
 */
export const Resource = <
  Output extends DefaultOutput,
  CreateOutput extends CreateFnOutput = CreateFnOutput<Output>,
>(
  name: string,
  create: ResourceCreateFn<CreateOutput>,
  init?: ResourceInitFn<CreateOutput, Output>,
) =>
  ({
    name,
    create,
    init: init ? init : (createOut: CreateOutput) => Promise.resolve(createOut),
  }) as ResourceInstance<Output, CreateOutput>;
