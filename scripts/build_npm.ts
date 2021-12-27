import { build } from "https://deno.land/x/dnt@0.11.0/mod.ts";

await build({
  entryPoints: ["./../run.ts"],
  outDir: "./../npm",
  cjs: false,
  shims: {
    deno: true,
  },
  package: {
    // package.json properties
    name: "test-env-parallelization",
    version: Deno.args[0],
    description: "TBD",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/tiloio/test-randomizing.git",
    },
    bugs: {
      url: "https://github.com/tiloio/test-randomizing/issues",
    },
  },
});

// post build steps
// Deno.copyFileSync("LICENSE", "npm/LICENSE");
// Deno.copyFileSync("README.md", "npm/README.md");