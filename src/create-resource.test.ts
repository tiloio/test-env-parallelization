import { assertEquals } from "https://deno.land/std@0.119.0/testing/asserts.ts";
import { createResource } from "./create-resource.ts";
import { Resource } from "./resource.ts";
import {
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "https://deno.land/x/mock@0.12.1/mod.ts";
import { withCleanup } from "./with-cleanup.ts";

Deno.test(
  "creates and intializes the resource",
  withCleanup(async () => {
    const expectedResultData = { hello: "world" };

    const resource = Resource(
      "test",
      () => Promise.resolve(expectedResultData as any),
      (result) => Promise.resolve(result),
    );

    const result = await createResource(resource);

    assertEquals(result.data, expectedResultData);
    assertEquals(result.created, true);
  }),
);

Deno.test(
  "creates and intializes the resource with given optional worker id",
  withCleanup(async () => {
    const create = spy();
    const resource = Resource(
      "test",
      create,
      (result) => Promise.resolve(result),
    );

    await createResource(resource, 1);
    await createResource(resource, 2);

    assertSpyCalls(create, 2);
  }),
);

Deno.test(
  "caches create result",
  withCleanup(async () => {
    const create = spy();
    const resource = Resource(
      "test",
      create,
      (result) => Promise.resolve(result),
    );

    await createResource(resource);
    await createResource(resource);

    assertSpyCalls(create, 1);
  }),
);

Deno.test(
  "intializes on cache hit",
  withCleanup(async () => {
    const init = spy();
    const resource = Resource(
      "test",
      () => Promise.resolve({ hello: "world" } as any),
      init,
    );

    await createResource(resource);
    await createResource(resource);

    assertSpyCalls(init, 2);

    assertEquals(init.calls[0].args[0].data, { hello: "world" });
    assertEquals(init.calls[1].args[0].data, { hello: "world" });
  }),
);

Deno.test(
  "does not cache create result of two different resource names",
  withCleanup(
    async () => {
      const create = spy();

      await createResource(Resource(
        "test1",
        create,
        (result) => Promise.resolve(result),
      ));
      await createResource(Resource(
        "test2",
        create,
        (result) => Promise.resolve(result),
      ));

      assertSpyCalls(create, 2);
    },
  ),
);

Deno.test(
  "create is always called with a workerId (defaults to 0)",
  withCleanup(async () => {
    const create = spy();

    await createResource(Resource(
      "test1",
      create,
      (result) => Promise.resolve(result),
    ));
    await createResource(
      Resource(
        "test2",
        create,
        (result) => Promise.resolve(result),
      ),
      2,
    );

    assertSpyCall(create, 0, { args: [{ workerId: 0 }] });
    assertSpyCall(create, 1, { args: [{ workerId: 2 }] });
  }),
);
