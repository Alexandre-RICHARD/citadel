import { describe, expect, it } from "vitest";

import { isRunningState } from "./isRunningState.ts";

describe("isRunningState.ts", () => {
	describe("Docker states", () => {
		it.each(["running", "restarting"])(
			"SHOULD count the container as on WHEN it is %s",
			(state) => {
				expect(isRunningState(state)).toBe(true);
			},
		);

		it.each(["exited", "created", "paused", "dead"])(
			"SHOULD count the container as off WHEN it is %s",
			(state) => {
				expect(isRunningState(state)).toBe(false);
			},
		);
	});
});
