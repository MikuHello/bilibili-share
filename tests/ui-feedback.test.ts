import { expect, it } from "vitest";
import { statusDismissDelay } from "../src/ui/feedback";

it("keeps failure feedback visible until the next action", () => {
  expect(statusDismissDelay(true)).toBeNull();
  expect(statusDismissDelay(false)).toBe(3000);
});
