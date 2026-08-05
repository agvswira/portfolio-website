import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

const output = resolve(process.cwd(), "dist/client");
const routes = [
  { name: "homepage", file: "index.html", budget: 120 * 1_024 },
  { name: "blog", file: "blog/awal-perjalanan-masuk-informatika/index.html", budget: 20 * 1_024 },
  { name: "project", file: "projects/botpass/index.html", budget: 20 * 1_024 },
];

for (const route of routes) {
  const html = readFileSync(resolve(output, route.file), "utf8");
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((match) => match[1]);
  const total = scripts.reduce((bytes, source) => {
    const path = resolve(output, source.replace(/^\//, ""));
    return bytes + gzipSync(readFileSync(path)).byteLength;
  }, 0);
  if (total > route.budget) {
    throw new Error(`${route.name}: ${total} B gzip melewati budget ${route.budget} B`);
  }
  console.log(`${route.name}: ${total} B eager JavaScript gzip (budget ${route.budget} B)`);
}
