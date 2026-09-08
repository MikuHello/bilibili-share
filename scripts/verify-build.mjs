import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const { version } = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const license = await readFile(new URL("../LICENSE", import.meta.url), "utf8");
const notices = await readFile(new URL("../THIRD_PARTY_NOTICES.md", import.meta.url), "utf8");
const assertLicensing = (source) => {
  assert.equal(header(source, "license"), "MIT");
  assert.ok(source.includes(license.trim()), "distributed script retains project license");
  assert.ok(source.includes(notices.trim()), "distributed script retains third-party notices");
};
const run = (...args) => spawnSync(process.execPath, ["scripts/build.mjs", ...args], { encoding: "utf8" });
const header = (source, key) => source.match(new RegExp(`^// @${key}\\s+(.+)$`, "m"))?.[1];
const releaseFile = new URL("../dist/bilibili-share-poster.user.js", import.meta.url);
const devFile = new URL("../dist/bilibili-share-poster.dev.user.js", import.meta.url);

assert.equal(run().status, 0, "release build succeeds");
const release = await readFile(releaseFile, "utf8");
assertLicensing(release);
assert.equal(header(release, "version"), version);
assert.equal(header(release, "name"), "Bilibili 分享海报");
assert.ok(!release.includes("bsp-debug-drawer"), "release excludes development drawer");

for (const revision of [undefined, 1, 2]) {
  const result = revision === undefined ? run("--dev") : run("--dev", "--revision", String(revision));
  assert.equal(result.status, 0, result.stderr);
  const dev = await readFile(devFile, "utf8");
  assertLicensing(dev);
  assert.equal(header(dev, "version"), `${version}-dev.${revision ?? 1}`);
  assert.equal(header(dev, "name"), "Bilibili 分享海报 · 开发调试", "dev identity stays stable across revisions");
  assert.ok(header(dev, "description").includes(`${version}-dev.${revision ?? 1}`));
  assert.ok(!/\bR\d+\b/.test(header(dev, "description")));
  assert.ok(dev.includes("bsp-debug-drawer"));
  assert.equal(await readFile(releaseFile, "utf8"), release, "development builds leave release artifact intact");
}

const dev = await readFile(devFile, "utf8");
for (const args of [["--dev", "--revision"], ["--revision", "1"], ["--dev", "--revision", "0"],
  ["--dev", "--revision", "01"], ["--dev", "--revision", "-1"], ["--dev", "--revision", "1.5"],
  ["--dev", "--revision", "999999999999999999999"], ["--dev", "--revision", "1", "--revision", "2"], ["--typo"]]) {
  const result = run(...args);
  assert.notEqual(result.status, 0, `invalid arguments rejected: ${args.join(" ")}`);
  assert.ok(result.stderr.trim(), "failure explains invalid arguments");
  assert.equal(await readFile(releaseFile, "utf8"), release, "invalid arguments preserve release");
  assert.equal(await readFile(devFile, "utf8"), dev, "invalid arguments preserve development build");
}
console.log("PASS: release/dev metadata, stable identities, separate artifacts and invalid revision guards");
