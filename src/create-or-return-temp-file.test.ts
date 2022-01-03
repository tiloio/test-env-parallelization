// deno-lint-ignore-file no-explicit-any
import {
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.119.0/testing/asserts.ts";
import {
  CrateOrReturnTemoFileResource,
  createOrReturnTempFile,
} from "./create-or-return-temp-file.ts";
import { sleep } from "./sleep.ts";
import { withCleanup } from "./with-cleanup.ts";

Deno.test(
  "create or return temp file should wait until creation is finsihed and return file content",
  withCleanup(async () => {
    const expectedContent = { first: "test1" } as any;

    const firstBlockingResource: CrateOrReturnTemoFileResource = {
      name: "blocking-test",
      creatorFn: async () => {
        await sleep(11);
        return expectedContent;
      },
    };
    const secondResource: CrateOrReturnTemoFileResource = {
      name: "blocking-test",
      creatorFn: () => Promise.resolve({ second: "test2" } as any),
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
  }),
);

Deno.test(
  "create or return temp file should fail if lock file is not release after specified time",
  withCleanup(async () => {
    const firstBlockingResource: CrateOrReturnTemoFileResource = {
      name: "blocking-test",
      creatorFn: async () => {
        await sleep(11);
        return { some: "thing" } as any;
      },
    };
    const secondResource: CrateOrReturnTemoFileResource = {
      name: "blocking-test",
      creatorFn: () => Promise.resolve({ second: "test2" } as any),
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
  }),
);
Deno.test(
  "create or return temp file should return temp file on second execution for the same name",
  withCleanup(async () => {
    const expectedContent = { first: "test1" } as any;

    const firstBlockingResource: CrateOrReturnTemoFileResource = {
      name: "test",
      creatorFn: () => Promise.resolve(expectedContent),
    };

    await createOrReturnTempFile(firstBlockingResource);
    const result = await createOrReturnTempFile(firstBlockingResource);

    assertEquals(result.data, expectedContent);
    assertEquals(result.created, false);
  }),
);
