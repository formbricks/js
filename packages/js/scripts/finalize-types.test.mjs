import { describe, expect, test } from "vitest";
import { finalizeTypes, toCommonJsTypes } from "./finalize-types.mjs";

const rollup = `declare const formbricks: TFormbricks;
export default formbricks;

declare interface TFormbricks {
    track: (code: string) => Promise<void>;
}

export { }
`;

const tscIndex = `import type { TFormbricks } from "./types/formbricks";
declare global {
    interface Window {
        formbricks: TFormbricks | undefined;
    }
}
declare const formbricks: TFormbricks;
export default formbricks;
`;

describe("finalizeTypes", () => {
  test("restores the global Window augmentation that the rollup drops", () => {
    expect(
      finalizeTypes(rollup, tscIndex),
    ).toBe(`declare const formbricks: TFormbricks;
export default formbricks;

declare interface TFormbricks {
    track: (code: string) => Promise<void>;
}

declare global {
    interface Window {
        formbricks: TFormbricks | undefined;
    }
}

export { }
`);
  });

  test("leaves the rollup unchanged when the entry point has no global block", () => {
    expect(finalizeTypes(rollup, "export default formbricks;\n")).toBe(rollup);
  });

  test("does not add the block twice when the rollup already has it", () => {
    const once = finalizeTypes(rollup, tscIndex);
    expect(finalizeTypes(once, tscIndex)).toBe(once);
  });
});

describe("toCommonJsTypes", () => {
  test("types the CommonJS bundle's module.exports = formbricks with export =", () => {
    const esmTypes = `declare const formbricks: TFormbricks;
export default formbricks;

/** How surveys render. */
export declare type TAppearance = "light" | "dark";

declare interface TFormbricks {
    setAppearance: (appearance: TAppearance) => void;
}

declare global {
    interface Window {
        formbricks: TFormbricks | undefined;
    }
}

export { }
`;

    expect(
      toCommonJsTypes(esmTypes),
    ).toBe(`declare const formbricks: TFormbricks;

declare namespace formbricks {
    /** How surveys render. */
    export type TAppearance = "light" | "dark";

    interface TFormbricks {
        setAppearance: (appearance: TAppearance) => void;
    }
}

type TFormbricks = formbricks.TFormbricks;

declare global {
    interface Window {
        formbricks: TFormbricks | undefined;
    }
}

export = formbricks;
`);
  });

  test("fails loudly when the rollup no longer has the expected default export", () => {
    expect(() =>
      toCommonJsTypes("export declare type TAppearance = string;\n"),
    ).toThrow(/default export/);
  });
});
