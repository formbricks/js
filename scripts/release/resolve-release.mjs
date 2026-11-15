import { pathToFileURL } from "node:url";

// SemVer 2.0.0 without build metadata (https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string).
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?$/;

export function resolveRelease({ tag, prerelease }) {
  const version = tag.startsWith("v") ? tag.slice(1) : tag;
  const match = SEMVER.exec(version);
  if (!match) {
    throw new Error(
      `Tag "${tag}" is not a valid semver version. Use MAJOR.MINOR.PATCH or MAJOR.MINOR.PATCH-PRERELEASE, optionally prefixed with "v" (build metadata is not allowed).`,
    );
  }
  const isPrerelease = match[4] !== undefined;
  if (isPrerelease && !prerelease) {
    throw new Error(
      `Tag "${tag}" is a prerelease version, but the GitHub release is not marked as a pre-release. Recreate the release on the same tag with "Set as a pre-release" ticked.`,
    );
  }
  if (!isPrerelease && prerelease) {
    throw new Error(
      `Tag "${tag}" is a stable version, but the GitHub release is marked as a pre-release. Recreate the release on the same tag with "Set as a pre-release" unticked.`,
    );
  }
  return { version, distTag: isPrerelease ? "next" : "latest" };
}

function parseFlag(name, value) {
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${name} must be "true" or "false", got "${value ?? ""}".`);
}

// Usage (in a workflow step):
//   RELEASE_TAG=v1.2.3 RELEASE_PRERELEASE=false node scripts/release/resolve-release.mjs >> "$GITHUB_OUTPUT"
// Prints `version=<semver>` and `dist-tag=<latest|next>`.
function main() {
  try {
    const { version, distTag } = resolveRelease({
      tag: process.env.RELEASE_TAG ?? "",
      prerelease: parseFlag(
        "RELEASE_PRERELEASE",
        process.env.RELEASE_PRERELEASE,
      ),
    });
    process.stdout.write(`version=${version}\ndist-tag=${distTag}\n`);
  } catch (error) {
    process.stderr.write(`::error::${error.message}\n`);
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
