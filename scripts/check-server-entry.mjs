import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const outputDirectory = resolve(".vercel/output");
const functionDirectory = resolve(outputDirectory, "functions/_render.func");
const functionConfig = JSON.parse(
  await readFile(resolve(functionDirectory, ".vc-config.json"), "utf8")
);
const outputConfig = JSON.parse(await readFile(resolve(outputDirectory, "config.json"), "utf8"));

assert.equal(functionConfig.runtime, "nodejs24.x");
assert.equal(functionConfig.supportsResponseStreaming, true);

for (const pathname of ["/api/contact", "/api/chat"]) {
  const route = outputConfig.routes.find((candidate) => candidate.src === `^${pathname}/?$`);
  assert.equal(route?.dest, "_render", `${pathname} must route to the server function`);
}

const entryUrl = pathToFileURL(resolve(functionDirectory, functionConfig.handler));
const entry = await import(entryUrl.href);
assert.equal(typeof entry.default?.fetch, "function", "Vercel entry must export fetch()");

for (const pathname of ["/api/contact", "/api/chat"]) {
  const response = await entry.default.fetch(
    new globalThis.Request(`https://aguswira.dev${pathname}`, {
      method: "POST",
      headers: {
        "content-type": "text/plain",
        origin: "https://aguswira.dev",
      },
      body: "unsupported",
    })
  );
  assert.equal(response.status, 415, `${pathname} must preserve its media-type contract`);
  assert.deepEqual(await response.json(), { error: "Content-Type tidak didukung." });
}

console.log("Built Vercel entry routes both API endpoints and preserves their 415 contract.");
