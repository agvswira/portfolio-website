import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { URL } from "node:url";

const output = resolve(process.cwd(), "dist/client");

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function routeFile(pathname) {
  const clean = decodeURIComponent(pathname).replace(/^\/+/, "");
  const candidates = clean
    ? [
        resolve(output, clean),
        resolve(output, clean, "index.html"),
        resolve(output, `${clean}.html`),
      ]
    : [resolve(output, "index.html")];
  return candidates.find(existsSync);
}

const failures = [];
let checked = 0;
for (const file of walk(output).filter((path) => path.endsWith(".html"))) {
  const html = readFileSync(file, "utf8");
  for (const match of html.matchAll(/\b(?:href|src|action)="([^"]+)"/g)) {
    const value = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/.test(value)) continue;
    const target = new URL(value, `https://local.test/${file.replace(`${output}/`, "")}`);
    if (target.pathname.startsWith("/api/")) continue;
    checked += 1;
    const targetFile = routeFile(target.pathname);
    if (!targetFile) {
      failures.push(`${file.replace(`${output}/`, "")}: ${value} tidak ditemukan`);
      continue;
    }
    if (target.hash && targetFile.endsWith(".html")) {
      const id = decodeURIComponent(target.hash.slice(1)).replace(/["&<>]/g, "");
      const targetHtml = readFileSync(targetFile, "utf8");
      if (!targetHtml.includes(`id="${id}"`)) {
        failures.push(`${file.replace(`${output}/`, "")}: fragment ${value} tidak ditemukan`);
      }
    }
  }
}

if (failures.length) throw new Error(`Internal link check gagal:\n${failures.join("\n")}`);
console.log(`Validated ${checked} generated internal links and assets.`);
