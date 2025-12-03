import js from "@eslint/js";
import tseslint from "typescript-eslint";
import vitest from "@vitest/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import checkFilePlugin from "eslint-plugin-check-file";
import prettierPlugin from "eslint-plugin-prettier";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export default [
  // Ignore patterns
  {
    ignores: [
      "node_modules/",
      "dist/",
      "coverage/",
      "*.config.js",
      "*.config.ts",
      "*.config.mjs",
      "*.d.ts",
    ],
  },

  // Base ESLint recommended rules
  js.configs.recommended,

  // Prettier rules
  eslintConfigPrettier,

  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Main configuration
  {
    plugins: {
      import: importPlugin,
      "check-file": checkFilePlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // no unused vars errors out but not when we use _
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // Import hygiene
      "import/no-duplicates": "error",
      "import/newline-after-import": "warn",

      "check-file/filename-naming-convention": [
        "error",
        { "**/*.{ts,tsx}": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],
      "prettier/prettier": ["error", { trailingComma: "es5" }],
    },
  },

  // Vitest test files configuration
  {
    files: ["**/*.{test,spec}.ts", "**/*.{test,spec}.tsx"],
    plugins: {
      vitest,
    },
    rules: {
      "vitest/consistent-test-it": [
        "error",
        { fn: "test", withinDescribe: "test" },
      ],
    },
    settings: {
      vitest: {
        typecheck: true,
      },
    },
  },
];
