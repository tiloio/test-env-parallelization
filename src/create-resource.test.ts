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

  const expectedResultData = { hello: "world" };

  const resource: Resource = {
    name: "test",
    creatorFn: () => Promise.resolve(expectedResultData),
    initializationFn: (result) => Promise.resolve(result),
  };

  const result = await createResource(resource);

  assertEquals(result.data, expectedResultData);
  assertEquals(result.created, true);
});

Deno.test(
  "creates and intializes the resource with given optional worker id",
  async () => {
    await cleanup();

    const creatorFn = spy();
    const resource: Resource = {
      name: "test",
      creatorFn,
      initializationFn: () => Promise.resolve({}),
    };

    await createResource(resource, "1");
    await createResource(resource, "2");

    assertSpyCalls(creatorFn, 2);
  }
);

Deno.test("caches creatorFn result", async () => {
  await cleanup();

  const creatorFn = spy();
  const resource: Resource = {
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
  const resource: Resource = {
    name: "test",
    creatorFn: () => Promise.resolve({ hello: "world" }),
    initializationFn,
  };

  await createResource(resource);
  await createResource(resource);

  assertSpyCalls(initializationFn, 2);

  assertEquals(initializationFn.calls[0].args[0].data, { hello: "world" });
  assertEquals(initializationFn.calls[1].args[0].data, { hello: "world" });
});

Deno.test(
  "does not cache creatorFn result of two different resource names",
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
