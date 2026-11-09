import { describe, expect, it } from "vitest";

import { getPlayTimeMinutes } from "./getPlayTimeMinutes";
import { PlayTimeViewEnum } from "./playTimeView.enum";

const PLAY_TIMES = { trackedPlayTimeMinutes: 90, estimatedPlayTimeMinutes: 30 };

describe("getPlayTimeMinutes.ts", () => {
	describe("views", () => {
		it.each([
			{ view: PlayTimeViewEnum.TOTAL, minutes: 120 },
			{ view: PlayTimeViewEnum.TRACKED, minutes: 90 },
			{ view: PlayTimeViewEnum.ESTIMATED, minutes: 30 },
		])(
			"SHOULD give $minutes minutes WHEN the view is $view",
			({ view, minutes }) => {
				expect(getPlayTimeMinutes(PLAY_TIMES, view)).toBe(minutes);
			},
		);
	});
});
