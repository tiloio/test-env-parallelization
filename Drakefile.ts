import { desc, run, task, sh } from "https://deno.land/x/drake@v1.5.0/mod.ts";

const version = "0.0.1";

desc("Minimal Drake task");
task("test", [], async () => {
  await sh("deno test --allow-env=TMPDIR --allow-read --allow-write --unstable src");
});
task("build", [], async () => {
  await Promise.all([
    sh(`deno run -A ./build_main.ts ${version}`),
    sh(`deno run -A ./build_jest-adapter.ts ${version}`)
  ]);
});

run()