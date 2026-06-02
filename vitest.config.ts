import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],

  test: {
    environment: "jsdom",

    globals: true,

    setupFiles: ["./src/tests/setup.ts"],

    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],

    exclude: ["src/tests/e2e/**"],

    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
