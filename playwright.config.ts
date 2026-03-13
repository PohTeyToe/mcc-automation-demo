import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  use: {
    baseURL: "https://demo-app-seven-ebon.vercel.app",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  retries: 1,
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
