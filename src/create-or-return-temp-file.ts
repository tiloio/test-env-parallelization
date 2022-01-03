import { join } from "https://deno.land/std/path/mod.ts";
import {
  ResourceCreateFnWithoutOption,
  ResourceCreationResult,
} from "./resource.ts";
import { emptyDir, ensureDir } from "https://deno.land/std@0.78.0/fs/mod.ts";
import { sleep } from "./sleep.ts";
import tempDirectory from "https://deno.land/x/temp_dir@v1.0.0/mod.ts";

const tempDirPath = join(tempDirectory, "t_env_paral");
const errorCodeAlreadyExists = "EEXIST";

export type CreateOrReturnTempFileOptions = {
  waitTimeout?: number;
  maxWaitLoops?: number;
};

export type CrateOrReturnTemoFileResource = {
  name: string;
  creatorFn: ResourceCreateFnWithoutOption;
};

export const clearTemp = () => emptyDir(tempDirPath);
export const createOrReturnTempFile = async (
  resource: CrateOrReturnTemoFileResource,
  options?: CreateOrReturnTempFileOptions,
): Promise<ResourceCreationResult> => {
  await ensureDir(tempDirPath);
  const dataFilePath = join(tempDirPath, resource.name);
  const lockFilePath = join(tempDirPath, resource.name + ".lock");

  let lockFileCreated = false;

  try {
    const [dataFileExists, lockFileExists] = await Promise.all([
      exists(dataFilePath),
      exists(lockFilePath),
    ]);
    if (dataFileExists && !lockFileExists) {
      return await readDataFile(dataFilePath);
    }

    try {
      const lockFile = await Deno.open(lockFilePath, {
        createNew: true,
        write: true,
        read: true,
      });
      lockFile.close();
      lockFileCreated = true;
    } catch (error) {
      if (error.code !== errorCodeAlreadyExists) throw error;

      let counter = 0;
      const maxCounter = options?.maxWaitLoops ?? 1000;
      const waitTime = options?.waitTimeout ?? 100;

      let doesLockExist = await exists(lockFilePath);
      while (doesLockExist) {
        if (counter > maxCounter) {
          throw new Error(
            `Lock file ${lockFilePath} was not removed in time. Waited ${
              (counter * waitTime) / 1000
            } seconds.`,
          );
        }
        counter++;
        await sleep(waitTime);
        doesLockExist = await exists(lockFilePath);
      }

      return await readDataFile(dataFilePath);
    }

    const data = await resource.creatorFn();
    await Deno.writeTextFile(dataFilePath, JSON.stringify(data));
    return {
      path: dataFilePath,
      data,
      created: true,
      createdTimestamp: Date.now(),
    };
  } finally {
    if (lockFileCreated) await Deno.remove(lockFilePath);
  }
};

const readDataFile = async (dataFilePath: string) => {
  const fileBuffer = await Deno.readTextFile(dataFilePath);
  return {
    data: JSON.parse(fileBuffer),
    path: dataFilePath,
    created: false,
    createdTimestamp: Date.now(),
  };
};

async function exists(filePath: string) {
  try {
    await Deno.lstat(filePath);
    return true;
  } catch (_err) {
    return false;
  }
}
