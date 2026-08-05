import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = process.cwd();
const output = resolve(root, "dist/client");
const config = JSON.parse(readFileSync(resolve(root, "vercel.json"), "utf8"));
const globalHeaders = config.headers.find(({ source }) => source === "/(.*)")?.headers ?? [];
const csp = globalHeaders.find(({ key }) => key.toLowerCase() === "content-security-policy")?.value;

if (!csp) throw new Error("Content-Security-Policy tidak ditemukan di vercel.json");

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const missing = new Map();
for (const file of walk(output).filter((path) => path.endsWith(".html"))) {
  const html = readFileSync(file, "utf8");
  for (const match of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    const hash = `sha256-${createHash("sha256").update(match[1]).digest("base64")}`;
    if (!csp.includes(`'${hash}'`)) {
      const routes = missing.get(hash) ?? [];
      routes.push(file.replace(`${output}/`, ""));
      missing.set(hash, routes);
    }
  }
}

if (missing.size) {
  const details = [...missing].map(([hash, files]) => `${hash}: ${files.join(", ")}`).join("\n");
  throw new Error(`CSP belum memuat hash inline script berikut:\n${details}`);
}

console.log("CSP hashes match every inline script in the generated HTML.");
