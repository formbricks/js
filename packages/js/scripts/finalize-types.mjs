// API Extractor rolls the declarations into one file, which node16 consumers need, but drops
// `declare global` blocks. This puts the entry point's block back and writes the CommonJS types:
// the CommonJS bundle sets `module.exports = formbricks`, so its types need `export =`.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const GLOBAL_BLOCK = /^declare global \{\n[\s\S]*?^\}\n/m;
const ROLLUP_FOOTER = "\nexport { }\n";
const DEFAULT_EXPORT =
  "declare const formbricks: TFormbricks;\nexport default formbricks;\n";

/**
 * @param {string} rollup API Extractor's rolled-up declaration file.
 * @param {string} tscIndex The declaration file tsc emitted for the entry point.
 * @returns {string} The rollup with the entry point's `declare global` block restored.
 */
export const finalizeTypes = (rollup, tscIndex) => {
  const globalBlock = GLOBAL_BLOCK.exec(tscIndex)?.[0];
  if (!globalBlock || GLOBAL_BLOCK.test(rollup)) return rollup;
  if (!rollup.endsWith(ROLLUP_FOOTER)) {
    throw new Error("Unexpected rollup footer; update finalize-types.mjs");
  }
  return `${rollup.slice(0, -ROLLUP_FOOTER.length)}\n${globalBlock}${ROLLUP_FOOTER}`;
};

/**
 * @param {string} esmTypes The finalized ESM rollup.
 * @returns {string} The same declarations for the CommonJS bundle, as `export = formbricks`.
 */
export const toCommonJsTypes = (esmTypes) => {
  if (
    !esmTypes.startsWith(DEFAULT_EXPORT) ||
    !esmTypes.endsWith(ROLLUP_FOOTER)
  ) {
    throw new Error(
      "Rollup no longer starts with the formbricks default export; update finalize-types.mjs",
    );
  }
  const declarations = esmTypes.slice(
    DEFAULT_EXPORT.length,
    -ROLLUP_FOOTER.length,
  );
  const globalBlock = GLOBAL_BLOCK.exec(declarations)?.[0];
  const namespaceBody = declarations
    .replace(GLOBAL_BLOCK, "")
    .trim()
    .split("\n")
    .map((line) =>
      line.replace(/^export declare /, "export ").replace(/^declare /, ""),
    )
    .map((line) => (line === "" ? line : `    ${line}`))
    .join("\n");

  return [
    "declare const formbricks: TFormbricks;\n",
    `declare namespace formbricks {\n${namespaceBody}\n}\n`,
    "type TFormbricks = formbricks.TFormbricks;\n",
    ...(globalBlock ? [globalBlock] : []),
    "export = formbricks;\n",
  ].join("\n");
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const packageRoot = fileURLToPath(new URL("..", import.meta.url));
  const rollupPath = `${packageRoot}dist/index.d.ts`;
  const tscIndex = readFileSync(`${packageRoot}temp/dts/index.d.ts`, "utf8");
  writeFileSync(
    rollupPath,
    finalizeTypes(readFileSync(rollupPath, "utf8"), tscIndex),
  );
  writeFileSync(
    `${packageRoot}dist/index.d.cts`,
    toCommonJsTypes(readFileSync(rollupPath, "utf8")),
  );
}
