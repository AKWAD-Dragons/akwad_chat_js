import type { Config } from "@jest/types";
import { pathsToModuleNameMapper } from "ts-jest";
import stripJsonComments from "strip-json-comments";
import fs from "node:fs";

export function getPaths(
  tsConfigPath = "./tsconfig.json",
  prefix = "<rootDir>"
) {
  let readJson = (path: string): { [key: string]: any } => {
    let content = fs.readFileSync(path).toString();
    return JSON.parse(stripJsonComments(content));
  };

  let tsConfig = readJson(tsConfigPath);

  return pathsToModuleNameMapper(tsConfig?.compilerOptions?.paths || {}, {
    prefix,
  });
}

let config: Config.InitialOptions = {
  rootDir: __dirname,
  preset: "jest-preset-angular",
  testMatch: [`${__dirname}/**/*.spec.ts`],
  setupFilesAfterEnv: [`${__dirname}/jest-setup.ts`],
  globalSetup: "jest-preset-angular/global-setup",
  testEnvironment: "node",
  injectGlobals: false,
  onlyChanged: true,
  collectCoverage: false,
  moduleDirectories: ["node_modules", "types"],
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "html",
    "scss",
    "css",
    "node",
  ],
  transform: {
    "^.+\\.(ts|js|html)$": "jest-preset-angular",
    "^.+\\.(t|j)sx?$": "ts-jest",
  },
  moduleNameMapper: getPaths(),

  modulePathIgnorePatterns: ["dist", "lib"],
};
export default config;
