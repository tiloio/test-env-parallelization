import { join } from "https://deno.land/std/path/mod.ts";
import { Resource } from "./resource.ts";
import {
  ensureDir,
  exists,
  emptyDir,
} from "https://deno.land/std@0.78.0/fs/mod.ts";
import { sleep } from "./sleep.ts";
import tempDirectory from "https://deno.land/x/temp_dir@v1.0.0/mod.ts";

const tempDirPath = join(tempDirectory, "t_env_paral");
const errorCodeAlreadyExists = "EEXIST";

export type CreateOrReturnTempFileOptions = {
  waitTimeout?: number;
  maxWaitLoops?: number;
};

export const clearTemp = () => emptyDir(tempDirPath);
export const createOrReturnTempFile = async (
  resource: Resource,
  options?: CreateOrReturnTempFileOptions
): Promise<any> => {
  await ensureDir(tempDirPath);
  const tempPath = join(tempDirPath, resource.name);
  const tempLockPath = join(tempDirPath, resource.name + ".lock");

  let lockFileCreated = false;

  try {
    try {
      const lockFile = await Deno.open(tempLockPath, {
        createNew: true,
        write: true,
      });
      lockFile.close();
      lockFileCreated = true;
    } catch (error) {
      if (error.code !== errorCodeAlreadyExists) throw error;

      let counter = 0;
      const maxCounter = options?.maxWaitLoops ?? 1000;
      const waitTime = options?.waitTimeout ?? 100;

      let doesLockExist = await exists(tempLockPath);
      while (doesLockExist) {
        if (counter > maxCounter)
          throw new Error(
            `Lock file ${tempLockPath} was not removed in time. Waited ${
              (counter * waitTime) / 1000
            } seconds.`
          );
        counter++;
        await sleep(waitTime);
        doesLockExist = await exists(tempLockPath);
      }

      const fileBuffer = await Deno.readTextFile(tempPath);
      return { data: JSON.parse(fileBuffer), path: tempPath, created: false };
    }

    const data = await resource.creatorFn();
    await Deno.writeTextFile(tempPath, JSON.stringify(data));
    return { path: tempPath, data, created: true };
  } finally {
    if (lockFileCreated) await Deno.remove(tempLockPath);
  }
};
