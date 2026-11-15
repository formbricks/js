import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { resolveRelease } from "./resolve-release.mjs";

describe("resolveRelease", () => {
  it("publishes a stable tag to the latest dist-tag", () => {
    assert.deepEqual(resolveRelease({ tag: "5.4.0", prerelease: false }), {
      version: "5.4.0",
      distTag: "latest",
    });
  });

  it("strips a leading v from the tag", () => {
    assert.deepEqual(resolveRelease({ tag: "v5.4.0", prerelease: false }), {
      version: "5.4.0",
      distTag: "latest",
    });
  });

  it("publishes a prerelease tag to the next dist-tag", () => {
    assert.deepEqual(resolveRelease({ tag: "v5.4.0-rc.1", prerelease: true }), {
      version: "5.4.0-rc.1",
      distTag: "next",
    });
  });

  for (const tag of [
    "5.4",
    "v5.4.0.1",
    "05.4.0",
    "5.4.0-",
    "5.4.0-rc..1",
    "5.4.0+build.7",
    "release-5.4.0",
    "",
  ]) {
    it(`rejects the tag "${tag}" because it is not a semver version`, () => {
      assert.throws(
        () => resolveRelease({ tag, prerelease: false }),
        /not a valid semver version/,
      );
    });
  }

  it("refuses a prerelease tag on a release not marked as prerelease", () => {
    assert.throws(
      () => resolveRelease({ tag: "v5.4.0-rc.1", prerelease: false }),
      /not marked as a pre-release/,
    );
  });

  it("refuses a stable tag on a release marked as prerelease", () => {
    assert.throws(
      () => resolveRelease({ tag: "v5.4.0", prerelease: true }),
      /marked as a pre-release/,
    );
  });
});

describe("resolve-release CLI", () => {
  const script = fileURLToPath(
    new URL("./resolve-release.mjs", import.meta.url),
  );
  const run = (env) =>
    spawnSync(process.execPath, [script], {
      encoding: "utf8",
      env: { PATH: process.env.PATH, ...env },
    });

  it("prints the version and dist-tag as GitHub step outputs", () => {
    const result = run({
      RELEASE_TAG: "v5.4.0-beta.2",
      RELEASE_PRERELEASE: "true",
    });
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "version=5.4.0-beta.2\ndist-tag=next\n");
  });

  it("fails with a GitHub error annotation on an invalid tag", () => {
    const result = run({ RELEASE_TAG: "nightly", RELEASE_PRERELEASE: "false" });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.match(
      result.stderr,
      /^::error::Tag "nightly" is not a valid semver version/,
    );
  });

  it("fails when the prerelease flag is not true or false", () => {
    const result = run({ RELEASE_TAG: "v5.4.0" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /RELEASE_PRERELEASE must be "true" or "false"/);
  });
});
