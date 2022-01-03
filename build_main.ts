import { build } from "https://deno.land/x/dnt@0.11.0/mod.ts";

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm/main",
  cjs: false,
  test: false,
  shims: {
    custom: [{
      package: {
        name: "@deno/shim-deno",
        version: "0.1.1",
      },
      globalNames: ["Deno"],
    }]
  },
  package: {
    // package.json properties
    name: "test-env-parallelization",
    version: Deno.args[0],
    description: "Test framework independent parallelization helper for test environments.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/tiloio/test-env-parallelization.git",
    },
    bugs: {
      url: "https://github.com/tiloio/test-env-parallelization/issues",
    },
  },
});

// post build steps
// Deno.copyFileSync("LICENSE", "npm/LICENSE");
// Deno.copyFileSync("README.md", "npm/README.md");