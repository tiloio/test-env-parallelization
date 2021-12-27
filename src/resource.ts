export type Resource<Output extends { [key: string]: string } | void = void, Options = undefined> = {
    name: string;
    creatorFn: (options?: Options) => Promise<{ [key: string]: string }>;
    initializationFn: () => Promise<Output>;
}
