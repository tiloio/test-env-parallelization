import { Resource } from "../resource.ts";
import { createResource } from "../create-resource.ts";
import { runAndWait } from "./run-and-wait.ts";

const serverResource = Resource("web-server", async (options) => {
  const port = 3000 + options.workerId;

  await runAndWait({
    cmd: [
      "deno",
      "run",
      "--allow-net",
      "--allow-env=PORT",
      "./src/test/server.ts",
    ],
    env: {
      PORT: port.toString(10),
    },
    log: "HTTP webserver running.",
  });

  return { port };
});

const result = await createResource<{ port: number }>(
  serverResource,
  parseInt(Deno.env.get("id")!, 10),
);

const response = await fetch(`http://localhost:${result.port}`);
const responseBody = await response.text();

Deno.stdout.writeSync(
  new TextEncoder().encode(`${result.port},${responseBody}`),
);
