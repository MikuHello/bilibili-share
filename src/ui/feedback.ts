/** Failures stay visible; only successful actions dismiss automatically. */
export function statusDismissDelay(failed: boolean): number | null {
  return failed ? null : 3000;
}
