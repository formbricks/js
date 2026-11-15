import { defineConfig, devices } from "@playwright/test";

// The golden journey runs the playground built from this workspace (with the workspace build of
// @formbricks/js) against the server the harness in e2e/server started.
const appUrl = process.env.FORMBRICKS_URL ?? "http://localhost:3000";
const workspaceId =
  process.env.E2E_WORKSPACE_ID ?? "clsdkqaws00000000000000001";
const playgroundPort = 4173;

export default defineConfig({
  testDir: ".",
  // E2E is a required check and the merge queue cannot re-run a job, so retry once in the step.
  retries: 1,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  forbidOnly: !!process.env.CI,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  use: {
    baseURL: `http://localhost:${playgroundPort}`,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm --filter playground build && pnpm --filter playground preview --port ${playgroundPort} --strictPort`,
    url: `http://localhost:${playgroundPort}`,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_FORMBRICKS_API_HOST: appUrl,
      VITE_FORMBRICKS_WORKSPACE_ID: workspaceId,
    },
  },
});
