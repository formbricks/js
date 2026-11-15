#!/usr/bin/env bash
# Packs @formbricks/js exactly as `npm publish` ships it, installs the tarball into a scratch
# consumer project, and checks that the ESM and CJS entry points load and type-check under node16.
# Run after `pnpm build`.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
package_dir="$repo_root/packages/js"
typescript_version="$(node -p "require('$package_dir/package.json').devDependencies.typescript")"

work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

echo "Packing @formbricks/js"
(cd "$package_dir" && npm pack --silent --pack-destination "$work_dir" >/dev/null)
tarball="$(find "$work_dir" -maxdepth 1 -name '*.tgz' -print -quit)"
tar -tzf "$tarball"

consumer_dir="$work_dir/consumer"
mkdir -p "$consumer_dir"
cd "$consumer_dir"

cat >package.json <<'JSON'
{ "name": "consumer", "private": true, "type": "module" }
JSON

cat >tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": false,
    "types": []
  },
  "files": ["esm.ts", "cjs.cts"]
}
JSON

cat >esm.ts <<'TS'
import formbricks, {
  type TAppearance,
  type TEmbeddedDataInput,
  type TFormbricksEventName,
} from "@formbricks/js";

const appearance: TAppearance = "system";
const data: TEmbeddedDataInput = { plan: "pro" };
const event: TFormbricksEventName = "formbricks_survey_shown";
const pending: Promise<void>[] = [
  formbricks.setup({ appUrl: "https://app.formbricks.com", workspaceId: "ws" }),
  formbricks.setUserId("user"),
  formbricks.setAttribute("plan", "pro"),
  formbricks.track("qa-action"),
  formbricks.setEmbeddedData(data),
  formbricks.setAppearance(appearance),
];
const off: () => void = formbricks.on(event, ({ surveyId }) => surveyId);
// The package also types the global the SDK script sets.
const sdkGlobal = window.formbricks;
export { off, pending, sdkGlobal };
TS

cat >cjs.cts <<'TS'
import formbricks = require("@formbricks/js");
import type { TAppearance } from "@formbricks/js";

const appearance: TAppearance = "dark";
const pending: Promise<void> = formbricks.setAppearance(appearance);
export = { pending };
TS

echo "Installing the tarball into a scratch consumer"
npm install --silent --no-audit --no-fund --ignore-scripts \
  "$tarball" "typescript@$typescript_version"

echo "Loading the ESM and CJS entry points"
node --input-type=module -e '
  const { default: formbricks } = await import("@formbricks/js");
  if (typeof formbricks.setup !== "function") throw new Error("ESM default export is not the SDK");
'
node --input-type=commonjs -e '
  const formbricks = require("@formbricks/js");
  if (typeof formbricks.setup !== "function") throw new Error("CJS export is not the SDK");
'

echo "Type-checking the consumer against the packed types"
npx --no-install tsc -p tsconfig.json

echo "Consumer check passed"
