# Glossary

Domain terms the code and architecture reviews use. Only terms specific to this SDK belong here: no general
programming concepts, and no implementation details.

## Loading

**Wrapper** — This package, `@formbricks/js`. It validates `setup()`, loads js-core from the app URL and forwards calls to it; it has no dependency on js-core, so shared types are declared on both sides. _Avoid_: SDK core.

**js-core** — The Formbricks SDK script the wrapper loads from `<appUrl>/js/formbricks.umd.cjs`. It does the real work and is served by the Formbricks instance, so its version follows the instance, not this package. _Avoid_: core SDK, UMD bundle.

**App URL** — The base URL of the Formbricks instance (`appUrl`), required by `setup()`. The trailing slash is removed.

**Workspace** — What `setup()` connects to, identified by `workspaceId`. _Avoid_: project, environment.

**Environment ID** — The deprecated identifier `setup()` still accepts in place of `workspaceId`; it logs a deprecation warning when used alone.

**Method queue** — Calls made before setup finishes, held by the wrapper and replayed in order after js-core's `setup()` resolves.

**Pending subscription** — An `on()` subscription made before js-core loaded. Unlike the method queue, it is forwarded before setup runs, so it hears `formbricks_setup_successful`.

**Prefetch** — js-core loading the survey renderer ahead of a trigger. On by default; `prefetch: false` turns it off for strict Content Security Policies.

## Identity and context

**User ID** — The identifier of the logged-in user, set with `setUserId()`. `logout()` logs the user out.

**Attribute** — A key–value string about the user, set with `setAttribute()` / `setAttributes()`.

**Embedded Data** — Key–value data attached to future responses without a trigger, set with `setEmbeddedData()` and removed with `clearEmbeddedData()`. Values land only on fields the survey declares as ingested Embedded Data. _Avoid_: hidden fields (those travel with a single `track()` call).

**Hidden fields** — Values passed with one `track()` call through `properties.hiddenFields`.

## Surveys and events

**Action** — Something the user did in the host app, reported with `track(code)`. js-core announces it as `formbricks_action_tracked`.

**Route change** — A client-side navigation reported to js-core with `registerRouteChange()`.

**Appearance** — How surveys render: `"light"` (default), `"dark"` or `"system"`. Set in `setup()` or with `setAppearance()`; needs Formbricks 6.1 or later.

**Event** — A notification js-core emits to `on()` subscribers, such as `formbricks_survey_shown` or `formbricks_response_submitted`. Instances that predate events are feature-detected and skipped with a warning.

**Debug event** — The `formbricks_debug` event, sent only in debug mode (`?formbricksDebug=true`), explaining why each survey on a fired trigger did or did not show. Its shape may change between versions.
