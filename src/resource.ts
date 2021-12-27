export type CreatorFn<
  Options = any,
  CreatorOutputData extends DefaultCratorOutputData = DefaultCratorOutputData
> = (options?: Options) => Promise<CreatorOutputData>;

export type DefaultCratorOutputData = { [key: string]: string };
export type CreatorOutput<
  Data extends DefaultCratorOutputData = DefaultCratorOutputData
> = {
  path: string;
  data: Data;
  created: boolean;
  date: Date;
};

export type Resource<
  Output extends DefaultCratorOutputData | void = any,
  CreatorOutputData extends DefaultCratorOutputData = DefaultCratorOutputData,
  Options = undefined
> = {
  name: string;
  creatorFn: CreatorFn<Options, CreatorOutputData>;
  initializationFn: (
    creatorOutput?: CreatorOutput<CreatorOutputData>
  ) => Promise<Output>;
};
