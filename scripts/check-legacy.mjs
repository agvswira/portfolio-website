import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const bannedPackages = ["framer-motion", "lenis", "next", "next-mdx-remote", "react", "react-dom"];
const lock = JSON.parse(readFileSync(resolve(process.cwd(), "package-lock.json"), "utf8"));
const installed = new Set(
  Object.keys(lock.packages ?? {})
    .filter((path) => path.startsWith("node_modules/"))
    .map((path) => path.slice("node_modules/".length))
);
const packages = bannedPackages.filter((name) => installed.has(name));
if (packages.length) throw new Error(`Legacy packages ditemukan: ${packages.join(", ")}`);

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const markers = ["/_next/", "next/dist", "react.production", "framer-motion", "next-mdx-remote"];
const matches = [];
for (const file of walk(resolve(process.cwd(), "dist")).filter((path) => !path.endsWith(".map"))) {
  const content = readFileSync(file);
  if (content.includes(0)) continue;
  const text = content.toString("utf8");
  for (const marker of markers) {
    if (text.includes(marker)) matches.push(`${file}: ${marker}`);
  }
}
if (matches.length) throw new Error(`Legacy build markers ditemukan:\n${matches.join("\n")}`);

console.log("No legacy framework packages or generated-output markers found.");
