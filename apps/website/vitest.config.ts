import { defineConfig } from "vitest/config";

// Vitest's defaults, plus React's automatic JSX runtime (as Docusaurus compiles the site), so specs can import .tsx
// components such as the agent demos (tests/landing-agents.spec.ts).
export default defineConfig({
  esbuild: { jsx: "automatic" },
});
