import { spawnSync } from "node:child_process";

// Verify the exact distributable; isolated suites still accept production source.
const build = spawnSync(process.execPath, ["scripts/build.mjs"], { stdio: "inherit" });
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);
const output = process.env.BSP_EVIDENCE_DIR ?? ".scratch/bilibili-share-poster/usage-refinement/evidence/ticket07";
for (const suite of ["b3-poster", "text-recovery", "text-isolation", "share-targets", "update-races", "independent-exports", "final-panel", "appearance", "lifecycle", "update-performance"]) {
  const result = spawnSync(process.execPath, [`scripts/verify-${suite}.mjs`], {
    stdio: "inherit",
    env: { ...process.env, BSP_TEST_BUNDLE: "dist/bilibili-share-poster.user.js", BSP_EVIDENCE_DIR: `${output}/${suite}` },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
