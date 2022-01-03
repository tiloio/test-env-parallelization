import { readLines } from "https://deno.land/std@0.79.0/io/bufio.ts";

export const runAndWait = async (
  options: { cmd: string[]; env: { [key: string]: string }; log: string },
) => {
  const p = Deno.run({
    cmd: options.cmd,
    env: options.env,
    stderr: "piped",
    stdout: "piped",
  });

  if (!p.stderr && !p.stdout) throw new Error("No stderr or stdout!");

  for await (const line of readLines(p.stdout)) {
    if (line?.trim()?.toLowerCase().includes(options.log.toLowerCase())) {
      return { close: p.close };
    }
  }

  for await (const line of readLines(p.stderr)) {
    if (line.trim()) {
      p.close();
      throw new Error(`Subprocess closed with: "${line}"`);
    }
  }
};
