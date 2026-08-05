import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import vercel from "@astrojs/vercel";
import { defineConfig, envField } from "astro/config";
import icon from "astro-icon";
import remarkGfm from "remark-gfm";

export default defineConfig({
  site: "https://aguswira.dev",
  output: "static",
  adapter: vercel(),
  env: {
    schema: {
      AI_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      AI_BASE_URL: envField.string({ context: "server", access: "secret", optional: true }),
      AI_MODEL: envField.string({ context: "server", access: "secret", optional: true }),
      RESEND_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      CONTACT_EMAIL: envField.string({ context: "server", access: "secret", optional: true }),
      CONTACT_FROM_EMAIL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      UPSTASH_REDIS_REST_URL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      UPSTASH_REDIS_REST_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      RATE_LIMIT_SALT: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
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
          "message-circle",
          "send",
          "target",
          "users",
          "x",
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
