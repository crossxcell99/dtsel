// jest.config.ts
import type { Config } from "jest";

// Or async function
export default async (): Promise<Config> => {
  return {
    testEnvironment: "jsdom",
    verbose: true,
  };
};
