// Reads the npm registry for the release workflow.
//
//   node scripts/release/npm-registry.mjs exists <package> <version>
//     Prints `exists=true|false` (a GitHub step output). Fails if the registry errors,
//     so the publish step never guesses.
//
//   node scripts/release/npm-registry.mjs verify <package> <version> <dist-tag>
//       [--timeout-seconds 600] [--interval-seconds 15]
//     Polls until <dist-tag> points at <version>. Fails after the timeout.
//
// Both accept --registry <url> (default https://registry.npmjs.org).

import { setTimeout } from "node:timers/promises";
import { parseArgs } from "node:util";

const USAGE =
  "Usage: npm-registry.mjs exists <package> <version> | verify <package> <version> <dist-tag> [--timeout-seconds N] [--interval-seconds N] [--registry URL]";

// Returns the package document, or null when the registry has never seen the package.
async function fetchPackument(registry, name) {
  const url = `${registry.replace(/\/$/, "")}/${name.replace("/", "%2f")}`;
  const response = await fetch(url, {
    headers: {
      // The abbreviated document holds `versions` and `dist-tags`, which is all we read.
      accept: "application/vnd.npm.install-v1+json",
      "cache-control": "no-cache",
    },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`GET ${url} returned HTTP ${response.status}.`);
  }
  return response.json();
}

async function exists({ registry, name, version }) {
  const packument = await fetchPackument(registry, name);
  const found = Object.hasOwn(packument?.versions ?? {}, version);
  process.stdout.write(`exists=${found}\n`);
}

async function verify({
  registry,
  name,
  version,
  distTag,
  timeoutSeconds,
  intervalSeconds,
}) {
  const deadline = Date.now() + timeoutSeconds * 1000;
  let current;
  for (;;) {
    let status;
    try {
      const packument = await fetchPackument(registry, name);
      current = packument?.["dist-tags"]?.[distTag];
      if (current === version) {
        process.stdout.write(
          `${name}@${version} is live on the "${distTag}" dist-tag.\n`,
        );
        return;
      }
      status = `"${distTag}" points at ${current ?? "nothing"}`;
    } catch (error) {
      // The registry CDN has hiccups; keep polling until the deadline.
      status = error.message;
    }
    if (Date.now() + intervalSeconds * 1000 > deadline) break;
    process.stdout.write(`${status}; waiting for ${version}...\n`);
    await setTimeout(intervalSeconds * 1000);
  }
  throw new Error(
    `${name}@${version} did not appear on the "${distTag}" dist-tag within ${timeoutSeconds}s (it points at ${current ?? "nothing"}).`,
  );
}

function parseSeconds(name, value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error(`--${name} must be a positive number. ${USAGE}`);
  }
  return seconds;
}

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      registry: { type: "string", default: "https://registry.npmjs.org" },
      "timeout-seconds": { type: "string", default: "600" },
      "interval-seconds": { type: "string", default: "15" },
    },
  });
  const [command, name, version, distTag] = positionals;
  const { registry } = values;

  if (command === "exists" && positionals.length === 3) {
    return exists({ registry, name, version });
  }
  if (command === "verify" && positionals.length === 4) {
    return verify({
      registry,
      name,
      version,
      distTag,
      timeoutSeconds: parseSeconds(
        "timeout-seconds",
        values["timeout-seconds"],
      ),
      intervalSeconds: parseSeconds(
        "interval-seconds",
        values["interval-seconds"],
      ),
    });
  }
  throw new Error(USAGE);
}

try {
  await main();
} catch (error) {
  process.stderr.write(`::error::${error.message}\n`);
  process.exitCode = 1;
}
