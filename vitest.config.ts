/**
 * Vitest configuration for ScholarLens tests.
 * Owner: AlBaraa (AI & Backend Engineer).
 *
 * Uses the @ path alias to match Next.js tsconfig paths so imports
 * like "@/lib/scholarlens/schema" resolve correctly in tests.
 */
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    /** Run all .test.ts files in the tests/ directory. */
    include: ["tests/**/*.test.ts"],

    /** Enable globals (describe, it, expect) without explicit imports. */
    globals: false,

    /** Use Node environment (not jsdom) since we test server-side code. */
    environment: "node",
  },
  resolve: {
    alias: {
      /** Match the @ alias from tsconfig.json → src/ */
      "@": path.resolve(__dirname, "src"),
    },
  },
});
