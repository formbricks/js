import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./npm-registry.mjs", import.meta.url));

// A fake npm registry. Each test sets `respond` to decide what GET /<package> returns.
let respond;
let requests = [];
let registry;
const server = createServer((req, res) => {
  requests.push(req.url);
  const { status, body } = respond(requests.length);
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
});

before(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  registry = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

function run(args) {
  requests = [];
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      [script, ...args, "--registry", registry],
      (error, stdout, stderr) =>
        resolve({ status: error ? error.code : 0, stdout, stderr }),
    );
  });
}

const packument = (versions, distTags) => ({
  status: 200,
  body: {
    name: "@formbricks/js",
    "dist-tags": distTags,
    versions: Object.fromEntries(versions.map((v) => [v, { version: v }])),
  },
});

describe("npm-registry exists", () => {
  it("reports a version that is already published", async () => {
    respond = () => packument(["5.3.0", "5.4.0"], { latest: "5.4.0" });
    const result = await run(["exists", "@formbricks/js", "5.4.0"]);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "exists=true\n");
  });

  it("reports a version that is not published yet", async () => {
    respond = () => packument(["5.3.0"], { latest: "5.3.0" });
    const result = await run(["exists", "@formbricks/js", "5.4.0"]);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "exists=false\n");
  });

  it("treats a package the registry has never seen as not published", async () => {
    respond = () => ({ status: 404, body: { error: "Not found" } });
    const result = await run(["exists", "@formbricks/js", "5.4.0"]);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "exists=false\n");
  });

  it("requests the scoped package by its escaped name", async () => {
    respond = () => packument(["5.4.0"], { latest: "5.4.0" });
    await run(["exists", "@formbricks/js", "5.4.0"]);
    assert.deepEqual(requests, ["/@formbricks%2Fjs"]);
  });

  it("escapes every reserved character in the name, not just the first slash", async () => {
    respond = () => ({ status: 404, body: { error: "Not found" } });
    await run(["exists", "@scope/a/b?c", "1.0.0"]);
    assert.deepEqual(requests, ["/@scope%2Fa%2Fb%3Fc"]);
  });

  it("fails instead of guessing when the registry errors", async () => {
    respond = () => ({ status: 503, body: { error: "Service Unavailable" } });
    const result = await run(["exists", "@formbricks/js", "5.4.0"]);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, /^::error::.*HTTP 503/);
  });
});

describe("npm-registry verify", () => {
  const fast = ["--interval-seconds", "0.05", "--timeout-seconds", "2"];

  it("passes once the dist-tag points at the version", async () => {
    respond = () =>
      packument(["5.4.0-rc.1"], { latest: "5.3.0", next: "5.4.0-rc.1" });
    const result = await run([
      "verify",
      "@formbricks/js",
      "5.4.0-rc.1",
      "next",
      ...fast,
    ]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(
      result.stdout,
      /@formbricks\/js@5\.4\.0-rc\.1 is live on the "next" dist-tag/,
    );
  });

  it("keeps polling until the registry catches up", async () => {
    respond = (attempt) =>
      attempt < 3
        ? packument(["5.3.0"], { latest: "5.3.0" })
        : packument(["5.3.0", "5.4.0"], { latest: "5.4.0" });
    const result = await run([
      "verify",
      "@formbricks/js",
      "5.4.0",
      "latest",
      ...fast,
    ]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(requests.length, 3);
  });

  it("fails when the dist-tag never points at the version before the timeout", async () => {
    // Published, but the dist-tag went elsewhere: verify must not accept that.
    respond = () => packument(["5.3.0", "5.4.0"], { latest: "5.3.0" });
    const started = Date.now();
    const result = await run([
      "verify",
      "@formbricks/js",
      "5.4.0",
      "latest",
      "--interval-seconds",
      "0.05",
      "--timeout-seconds",
      "0.3",
    ]);
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /::error::@formbricks\/js@5\.4\.0 did not appear on the "latest" dist-tag within 0\.3s \(it points at 5\.3\.0\)/,
    );
    assert.ok(requests.length >= 2, `polled ${requests.length} time(s)`);
    assert.ok(Date.now() - started < 1500, "gave up close to the timeout");
  });

  it("rides out a transient registry error while polling", async () => {
    respond = (attempt) =>
      attempt === 1
        ? { status: 502, body: { error: "Bad Gateway" } }
        : packument(["5.4.0"], { latest: "5.4.0" });
    const result = await run([
      "verify",
      "@formbricks/js",
      "5.4.0",
      "latest",
      ...fast,
    ]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /HTTP 502/);
  });
});

describe("npm-registry usage", () => {
  for (const args of [
    ["publish", "@formbricks/js", "5.4.0"],
    ["exists", "@formbricks/js"],
    ["verify", "@formbricks/js", "5.4.0"],
  ]) {
    it(`rejects "${args.join(" ")}" with a usage error`, async () => {
      const result = await run(args);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /::error::Usage: npm-registry\.mjs/);
      assert.equal(requests.length, 0);
    });
  }
});
