import { clearCache } from "./create-resource.ts";
import { clearTemp } from "./create-or-return-temp-file.ts";

export const withCleanup = (test: () => Promise<void>) =>
  async () => {
    try {
      await clearTemp();
      clearCache();
      await test();
    } finally {
      await clearTemp();
      clearCache();
    }
  };
