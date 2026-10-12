import { defineConfig } from "allure";

export default defineConfig({
  name: "Rails with React E2E",
  output: "./allure-report",
  plugins: {
    awesome: { options: { singleFile: true } },
  },
});
