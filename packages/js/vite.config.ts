import { resolve } from "path";
import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";

const config = () => {
  return defineConfig({
    build: {
      emptyOutDir: false, // keep the dist folder to avoid errors with pnpm go when folder is empty during build
      minify: "terser",
      sourcemap: true,
      lib: {
        // Could also be a dictionary or array of multiple entry points
        entry: resolve(__dirname, "src/index.ts"),
        name: "formbricksJsWrapper",
        formats: ["es", "cjs"],
        fileName: "index",
      },
    },
    plugins: [
      dts({
        rollupTypes: true,
        bundledPackages: ["@formbricks/js-core"],
      }),
    ],
    test: {
      environment: "happy-dom",
      globals: true,
      include: ["src/**/*.{test,spec}.{js,ts}"],
      exclude: ["dist/**", "node_modules/**"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "lcov"],
        reportsDirectory: "./coverage",
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "node_modules/",
          "src/__tests__/",
          "**/*.d.ts",
          "**/*.config.*",
          "**/types/**",
        ],
      },
    },
  });
};

export default config;
