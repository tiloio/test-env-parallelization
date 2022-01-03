import type { ScriptsConfiguration } from "https://arweave.net/c_Zr-jv4RfZ1ERXdE3PMCT7GjMSGXAT1wKnhPbC4Cmg/mod.ts";

const srcDir = "src";
const version = "0.0.1";

const install = [`deno install -Af --unstable https://x.nest.land/eggs@0.3.10/eggs.ts`];
const test = `deno test --allow-env=TMPDIR --allow-read --allow-write --allow-run --allow-net --unstable ${srcDir}`;
const lint = `deno lint ${srcDir}`;
const fmt = `deno fmt ${srcDir}`;
const buildNpm = {
  cmd: {
    pll: [
      `deno run -A ./build_main.ts ${version}`,
      `deno run -A ./build_jest-adapter.ts ${version}`
    ]
  }
};
const testNpm = `npm --prefix nodejs-test test`;
const checkNpm = [buildNpm, testNpm];
const publishNpm = `cd ./npm && npm publish`;

const check = {
  cmd: {
    pll: [test, [fmt, lint], [buildNpm, testNpm]],
  },
  gitHook: "pre-commit",
};

export default <ScriptsConfiguration>{
  scripts: {
    install,
    test,
    testNpm,
    checkNpm,
    testWatch: {
      cmd: test,
      watch: true,
    },
    lint,
    fmt,
    check,
    buildNpm,
    publishNpm,
    releaseNpm: [check, buildNpm, testNpm, publishNpm],
  },
};
