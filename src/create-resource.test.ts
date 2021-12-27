import { assertEquals } from "https://deno.land/std@0.119.0/testing/asserts.ts";
import { clearCache, createResource } from "./create-resource.ts";
import { Resource } from "./resource.ts";
import {
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "https://deno.land/x/mock@0.12.1/mod.ts";
import { clearTemp } from "./create-or-return-temp-file.ts";

const cleanup = async () => {
  await clearTemp();
  clearCache();
};

Deno.test("creates and intializes the resource", async () => {
  await cleanup();

  const expectedResult = { hello: "world", initialized: true };
  const someCreatorResult = { hello: "world" };

  const resource: Resource<any> = {
    name: "test",
    creatorFn: () => Promise.resolve(someCreatorResult),
    initializationFn: (result) =>
      Promise.resolve({ ...result, initialized: true }),
  };

  const result = await createResource(resource);

  assertEquals(result, expectedResult);
});

Deno.test("caches creatorFn result", async () => {
  await cleanup();

  const creatorFn = spy();
  const resource: Resource<any> = {
    name: "test",
    creatorFn: creatorFn,
    initializationFn: (result) => Promise.resolve(result),
  };

  await createResource(resource);
  await createResource(resource);

  assertSpyCalls(creatorFn, 1);
});
Deno.test("intializes on cache hit", async () => {
  await cleanup();

  const initializationFn = spy();
  const resource: Resource<any> = {
    name: "test",
    creatorFn: () => Promise.resolve({ hello: "world" }),
    initializationFn,
  };

  await createResource(resource);
  await createResource(resource);

  assertSpyCalls(initializationFn, 2);
  assertSpyCall(initializationFn, 0, { args: [{ hello: "world" }] });
  assertSpyCall(initializationFn, 1, { args: [{ hello: "world" }] });
});

Deno.test(
  "does not cache creatorFn result of two differen resource names",
  async () => {
    await cleanup();

    const creatorFn = spy();

    await createResource({
      name: "test1",
      creatorFn: creatorFn,
      initializationFn: (result) => Promise.resolve(result),
    });
    await createResource({
      name: "test2",
      creatorFn: creatorFn,
      initializationFn: (result) => Promise.resolve(result),
    });

    assertSpyCalls(creatorFn, 2);
  }
);
