import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import remarkGfm from "remark-gfm";

export default defineConfig({
  site: "https://aguswira.dev",
  output: "static",
  adapter: vercel(),
  markdown: {
    processor: unified({ remarkPlugins: [remarkGfm] }),
    shikiConfig: { theme: "nord" },
  },
  integrations: [
    mdx(),
    icon({
      include: {
        lucide: [
          "brain",
          "chevron-down",
          "external-link",
          "languages",
          "lightbulb",
          "mail",
          "map-pin",
          "menu",
          "target",
          "users",
        ],
        "simple-icons": [
          "css",
          "discord",
          "docker",
          "figma",
          "git",
          "github",
          "html5",
          "instagram",
          "javascript",
          "jupyter",
          "linkedin",
          "linux",
          "mongodb",
          "mysql",
          "nodedotjs",
          "pandas",
          "python",
          "tensorflow",
        ],
      },
    }),
  ],
});
