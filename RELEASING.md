# Releasing `@formbricks/js`

Publishing a GitHub release publishes the SDK to npm. The tag is the version: there is no
version-bump PR, and `packages/js/package.json` on `main` keeps the placeholder `0.0.0-dev`.

The cross-SDK runbook, with the manual QA how-to and the golden journey, is the Notion doc
"SDK QA & Release" <!-- NOTION_SDK_QA_RELEASE_URL -->.

## What happens when you publish a release

`.github/workflows/release.yml` runs on `release: published` and does three jobs:

1. **Build** reads the tag, checks that it is semver and that it agrees with the GitHub
   "pre-release" box, writes the version into `packages/js/package.json` on the runner only,
   then builds and packs the SDK.
2. **Publish** publishes that tarball with npm trusted publishing (OIDC, no token). If the version
   is already on npm, it skips the publish, so re-running is always safe.
3. **Verify** polls npm until the version shows on its dist-tag, and fails after 10 minutes.

| Tag             | GitHub "Set as a pre-release" | npm dist-tag |
| --------------- | ----------------------------- | ------------ |
| `v5.4.0`        | unticked                      | `latest`     |
| `v5.4.0-rc.1`   | ticked                        | `next`       |
| `v5.4.0-beta.2` | ticked                        | `next`       |

The `v` prefix is optional. Build metadata (`+build.1`) is rejected. A tag and box that disagree
fail the build job before anything is published.

The release workflow does not run lint or tests: CI already ran on `main`. Nothing checks that QA
ran, so run it before you release.

## Cut a release

1. Make sure CI on `main` is green.
2. Run QA: Actions → **E2E** → **Run workflow** on `main`, with `server_version` set to the
   Formbricks image you release against (default `latest`). See the Notion doc for what to check.
3. Releases → **Draft a new release**.
4. Choose a tag: create `vX.Y.Z` on `main`.
5. Click **Generate release notes**. They come from the semantic PR titles. Edit if needed.
6. Leave **Set as a pre-release** unticked and tick **Set as the latest release**.
7. **Publish release**, then watch the **Release JS SDK** run until `Verify on npm` is green.

## Cut a prerelease

Same as above, with two differences:

- Tag `vX.Y.Z-rc.N` (or `-beta.N`, `-alpha.N`).
- Tick **Set as a pre-release**.

It publishes to the `next` dist-tag, so `npm install @formbricks/js` keeps resolving to the last
stable version. Testers install it with `npm install @formbricks/js@next`, or pin the exact version.

To ship the final version, cut a new stable release (`vX.Y.Z`). A prerelease is never moved to
`latest`.

## Recover from a failure

Never delete a tag, and never unpublish from npm. "Re-run" replays the original release event,
so editing the release afterwards does not change what a re-run does.

| What failed                                        | What to do                                                                                                                                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Build: tag is not semver                           | Delete the GitHub release (not the tag). Publish a new release on a correct tag.                                                                                                                 |
| Build: tag and "pre-release" box disagree          | Delete the GitHub release (not the tag). Create a release again on the same tag with the box set correctly.                                                                                      |
| Build: install, build or pack failed               | If it was flaky, **Re-run failed jobs**. If the code is broken, fix it on `main` and release the next patch version.                                                                             |
| Publish failed                                     | **Re-run failed jobs**. If the version reached npm before the failure, the publish step is skipped.                                                                                              |
| Verify timed out                                   | Run `npm view @formbricks/js dist-tags`. If the version is there now, re-run the failed job. If the dist-tag points elsewhere, a maintainer runs `npm dist-tag add @formbricks/js@X.Y.Z <tag>`. |
| A bad version shipped                              | Release a fixed patch version. If needed, point `latest` back with `npm dist-tag add @formbricks/js@<good> latest` and `npm deprecate @formbricks/js@<bad> "<reason>"`.                          |

## Maintaining the workflow

- npm trusted publishing is bound to the file name `release.yml`. Renaming it breaks publishing
  until the trusted publisher on npmjs.com is updated.
- The release logic lives in `scripts/release/` and has tests. Run them with
  `node --test "scripts/release/*.test.mjs"`.
