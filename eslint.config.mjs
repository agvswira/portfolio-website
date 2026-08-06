import eslint from "@eslint/js";
import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    ignores: [
      "node_modules/**",
      ".astro/**",
      ".vercel/**",
      ".worktrees/**",
      ".lighthouseci/**",
      ".test-results/**",
      "coverage/**",
      "dist/**",
      "*.tsbuildinfo",
    ],
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: { console: "readonly", process: "readonly" },
    },
  },
];
