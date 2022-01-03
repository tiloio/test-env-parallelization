import { assertEquals } from "https://deno.land/std@0.119.0/testing/asserts.ts";

const startWorker = async (id: number) => {
  const p = Deno.run({
    cmd: [
      "deno",
      "run",
      "--allow-net",
      "--allow-read",
      "--allow-write",
      "--allow-run",
      "--unstable",
      "--allow-env",
      "src/test/worker.ts",
    ],
    env: {
      id: id.toString(10),
    },
    stdout: "piped",
    stderr: "piped",
  });

  const { code } = await p.status();

  // Reading the outputs closes their pipes
  const rawOutput = await p.output();
  const rawError = await p.stderrOutput();

  if (code === 0) {
    await Deno.stdout.write(rawOutput);
  } else {
    const errorString = new TextDecoder().decode(rawError);
    console.log(errorString);
  }
  const res = new TextDecoder().decode(rawOutput);
  p.close();
  return res;
};

Deno.test("multi process", async () => {
  const result = await Promise.all([startWorker(1), startWorker(2)]);

  assertEquals(result, ["3001,1", "3002,1"]);
});

Deno.test("multi process multi executions", async () => {
  const result1 = await Promise.all([startWorker(1), startWorker(2)]);
  const result2 = await Promise.all([startWorker(1), startWorker(3)]);

  assertEquals([result1, result2], [["3001,1", "3002,1"], [
    "3001,1",
    "3003,1",
  ]]);
});
