import { Resource } from "./resource.ts";
import {
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.119.0/testing/asserts.ts";
import { sleep } from "./sleep.ts";
import {
  clearTemp,
  createOrReturnTempFile,
} from "./create-or-return-temp-file.ts";

Deno.test(
  "create or return temp file should wait until creation is finsihed and return file content",
  async () => {
    await clearTemp();
    const expectedContent = { first: "test1" };

    const firstBlockingResource: Resource = {
      name: "blocking-test",
      creatorFn: async () => {
        await sleep(11);
        return expectedContent;
      },
      initializationFn: () => Promise.resolve(),
    };
    const secondResource: Resource = {
      name: "blocking-test",
      creatorFn: () =>
        Promise.resolve({
          second: "test2",
        }),
      initializationFn: () => Promise.resolve(),
    };

    const runLater = async () => {
      await sleep(1);
      return createOrReturnTempFile(secondResource, { waitTimeout: 1 });
    };

    const [shouldBeCreated, shouldBeRead] = await Promise.all([
      createOrReturnTempFile(firstBlockingResource),
      runLater(),
    ]);

    assertEquals(shouldBeCreated.data, expectedContent);
    assertEquals(shouldBeCreated.created, true);
    assertEquals(shouldBeRead.created, false);
    assertEquals(shouldBeCreated.data, shouldBeRead.data);
  }
);

Deno.test(
  "create or return temp file should fail if lock file is not release after specified time",
  async () => {
    await clearTemp();
    const firstBlockingResource: Resource = {
      name: "blocking-test",
      creatorFn: async () => {
        await sleep(11);
        return { some: "thing" };
      },
      initializationFn: () => Promise.resolve(),
    };
    const secondResource: Resource = {
      name: "blocking-test",
      creatorFn: () =>
        Promise.resolve({
          second: "test2",
        }),
      initializationFn: () => Promise.resolve(),
    };

    const runLater = async () => {
      await sleep(1);
      return createOrReturnTempFile(secondResource, {
        waitTimeout: 1,
        maxWaitLoops: 0,
      });
    };

    const [, result]: any = await Promise.allSettled([
      createOrReturnTempFile(firstBlockingResource),
      runLater(),
    ]);

    assertEquals(result?.status, "rejected");
    assertStringIncludes(result?.reason.message, "was not removed in time");
  }
);
