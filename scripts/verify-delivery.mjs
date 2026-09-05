import { spawnSync } from "node:child_process";

// Each suite bundles production code and controls only external boundaries.
for (const suite of ["default-poster", "text-recovery", "share-targets", "final-panel", "appearance", "lifecycle"]) {
  const result = spawnSync(process.execPath, [`scripts/verify-${suite}.mjs`], { stdio: "inherit", env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
