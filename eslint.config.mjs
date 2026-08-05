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
      ".next/**",
      ".vercel/**",
      "dist/**",
      "next-env.d.ts",
      "src/app/**",
      "src/components/**",
      "src/lib/blog.ts",
      "src/lib/data/skills.ts",
      "src/lib/gsap.ts",
      "src/lib/projects.ts",
      "src/lib/rate-limit.ts",
    ],
  },
];
