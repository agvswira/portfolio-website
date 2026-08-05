import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";
import remarkGfm from "remark-gfm";

export default defineConfig({
  site: "https://aguswira.dev",
  output: "static",
  adapter: vercel(),
  markdown: {
    processor: unified({ remarkPlugins: [remarkGfm] }),
  },
  integrations: [mdx()],
});
