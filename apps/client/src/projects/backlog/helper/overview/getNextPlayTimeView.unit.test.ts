import { describe, expect, it } from "vitest";

import { getNextPlayTimeView } from "./getNextPlayTimeView";
import { PlayTimeViewEnum } from "./playTimeView.enum";

describe("getNextPlayTimeView.ts", () => {
	describe("cycle", () => {
		it.each([
			{ view: PlayTimeViewEnum.TOTAL, next: PlayTimeViewEnum.TRACKED },
			{ view: PlayTimeViewEnum.TRACKED, next: PlayTimeViewEnum.ESTIMATED },
			{ view: PlayTimeViewEnum.ESTIMATED, next: PlayTimeViewEnum.TOTAL },
		])("SHOULD go from $view to $next", ({ view, next }) => {
			expect(getNextPlayTimeView(view)).toBe(next);
		});
	});
});
