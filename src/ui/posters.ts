import { prepareDefaultPosterTarget } from "./default-poster";
import { invalidatePosterPng } from "./poster-png";

// Stable panel entry points; layout and encoding remain independently owned.
export { createDefaultPoster as createPoster } from "./default-poster";
export { exportPosterPng } from "./poster-png";

/** Commit target nodes and invalidate their PNG together after the async guard. */
export async function updatePosterTarget(poster: HTMLElement, target: string, isCurrent: () => boolean): Promise<void> {
  const commit = await prepareDefaultPosterTarget(target);
  if (!isCurrent()) return;
  commit(poster);
  invalidatePosterPng(poster);
}
