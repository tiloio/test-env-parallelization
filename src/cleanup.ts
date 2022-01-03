import { clearTemp } from "./create-or-return-temp-file.ts";

export const cleanup = async () => {
  await clearTemp();
};
