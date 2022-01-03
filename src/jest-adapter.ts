// deno-lint-ignore-file no-explicit-any ban-types
// need to manually import jest types. Found no way to do this automatic
interface FunctionLike {
  readonly name: string;
}
type EmptyFunction = () => void;

type ExtractEachCallbackArgs<T extends ReadonlyArray<any>> = {
  1: [T[0]];
  2: [T[0], T[1]];
  3: [T[0], T[1], T[2]];
  4: [T[0], T[1], T[2], T[3]];
  5: [T[0], T[1], T[2], T[3], T[4]];
  6: [T[0], T[1], T[2], T[3], T[4], T[5]];
  7: [T[0], T[1], T[2], T[3], T[4], T[5], T[6]];
  8: [T[0], T[1], T[2], T[3], T[4], T[5], T[6], T[7]];
  9: [T[0], T[1], T[2], T[3], T[4], T[5], T[6], T[7], T[8]];
  10: [T[0], T[1], T[2], T[3], T[4], T[5], T[6], T[7], T[8], T[9]];
  "fallback": Array<(T extends ReadonlyArray<infer U> ? U : any)>;
}[
  T extends Readonly<[any]> ? 1
    : T extends Readonly<[any, any]> ? 2
    : T extends Readonly<[any, any, any]> ? 3
    : T extends Readonly<[any, any, any, any]> ? 4
    : T extends Readonly<[any, any, any, any, any]> ? 5
    : T extends Readonly<[any, any, any, any, any, any]> ? 6
    : T extends Readonly<[any, any, any, any, any, any, any]> ? 7
    : T extends Readonly<[any, any, any, any, any, any, any, any]> ? 8
    : T extends Readonly<[any, any, any, any, any, any, any, any, any]> ? 9
    : T extends Readonly<[any, any, any, any, any, any, any, any, any, any]>
      ? 10
    : "fallback"
];

interface Each {
  // Exclusively arrays.
  <T extends any[] | [any]>(
    cases: ReadonlyArray<T>,
  ): (name: string, fn: (...args: T) => any, timeout?: number) => void;
  <T extends ReadonlyArray<any>>(
    cases: ReadonlyArray<T>,
  ): (
    name: string,
    fn: (...args: ExtractEachCallbackArgs<T>) => any,
    timeout?: number,
  ) => void;
  // Not arrays.
  <T>(
    cases: ReadonlyArray<T>,
  ): (name: string, fn: (...args: T[]) => any, timeout?: number) => void;
  (cases: ReadonlyArray<ReadonlyArray<any>>): (
    name: string,
    fn: (...args: any[]) => any,
    timeout?: number,
  ) => void;
  (strings: TemplateStringsArray, ...placeholders: any[]): (
    name: string,
    fn: (arg: any) => any,
    timeout?: number,
  ) => void;
}

interface Describe {
  // tslint:disable-next-line ban-types
  (name: number | string | Function | FunctionLike, fn: EmptyFunction): void;
  /** Only runs the tests inside this `describe` for the current file */
  only: Describe;
  /** Skips running the tests inside this `describe` for the current file */
  skip: Describe;
  each: Each;
}

interface CustomDescribe<T extends Function> {
  // tslint:disable-next-line ban-types
  (name: number | string | Function | FunctionLike, fn: T): void;
  /** Only runs the tests inside this `describe` for the current file */
  only: Describe;
  /** Skips running the tests inside this `describe` for the current file */
  skip: Describe;
}

const internalDescribe = <BodyCaller extends Function>(
  describeFn: Describe,
  bodyCaller: BodyCaller,
) =>
  (name: number | string | Function | FunctionLike, body: EmptyFunction) =>
    describeFn(name, () => bodyCaller(body));

declare const describe: Describe;

const createCustomDescribe = <T extends Function>(
  bodyCaller: T,
): CustomDescribe<T> => {
  const customDescribe = internalDescribe<T>(describe, bodyCaller) as any;
  customDescribe.only = internalDescribe<T>(describe.only, bodyCaller);
  customDescribe.skip = internalDescribe<T>(describe.skip, bodyCaller);
  return customDescribe;
};

export const jestWorkerId = () =>
  parseInt(Deno.env.get("JEST_WORKER_ID") ?? "0", 10);

export default createCustomDescribe;
