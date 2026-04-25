import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.spec.ts"],
  testPathIgnorePatterns: [
    "/node_modules/"
  ],
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  setupFiles: ["<rootDir>/jest.setup.js"],
  clearMocks: true,
  moduleNameMapper: {
    "^@tevalabs/xelma-bindings$": "<rootDir>/src/__mocks__/xelma-bindings.ts",
  },
};

export default config;
