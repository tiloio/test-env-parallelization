export type CreatorFn<
  CreatorOutputData extends DefaultCratorOutputData = DefaultCratorOutputData
> = () => Promise<CreatorOutputData>;

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
  Output extends DefaultCratorOutputData = any,
  CreatorOutputData extends DefaultCratorOutputData = DefaultCratorOutputData
> = {
  name: string;
  creatorFn: CreatorFn<CreatorOutputData>;
  initializationFn: (
    creatorOutput?: CreatorOutput<CreatorOutputData>
  ) => Promise<Output>;
};
