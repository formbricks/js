const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/*
 * Merged ESLint configuration:
 * - Extends both Vercel and Formbricks style guides.
 * - Supports TypeScript, Node.js, and additional rules/plugins.
 */

module.exports = {
  extends: [
    require.resolve("@vercel/style-guide/eslint/node"),
    require.resolve("@vercel/style-guide/eslint/typescript"),
  ],
  parserOptions: {
    project,
    tsconfigRootDir: __dirname,
  },
  globals: {
    React: true,
    JSX: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
      node: {
        extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "*.config.js",
    "*.config.ts",
    "*.d.ts",
  ],
  plugins: ["@vitest"],
  rules: {
    "@vitest/consistent-test-it": [
      "error",
      { fn: "test", withinDescribe: "test" },
    ],
  },
};
