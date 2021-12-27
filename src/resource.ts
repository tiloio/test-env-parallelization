export type Resource<
  Output extends { [key: string]: string } | void = any,
  CreatorOutput extends { [key: string]: string } = { [key: string]: string },
  Options = undefined
> = {
  name: string;
  creatorFn: (options?: Options) => Promise<CreatorOutput>;
  initializationFn: (creatorOutput?: CreatorOutput) => Promise<Output>;
};
