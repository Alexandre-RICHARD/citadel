import { describe, expect, it } from "vitest";

import { describeBossDeletion } from "./describeBossDeletion";

describe("describeBossDeletion.ts", () => {
	describe("deaths of the boss", () => {
		it.each([
			{ totalDeath: 0, expected: "Cette action est définitive." },
			{ totalDeath: 1, expected: "Sa mort sera supprimée définitivement." },
			{
				totalDeath: 4,
				expected: "Ses 4 morts seront supprimées définitivement.",
			},
		])(
			"SHOULD announce $expected WHEN the boss has $totalDeath deaths",
			({ totalDeath, expected }) => {
				expect(describeBossDeletion(totalDeath)).toBe(expected);
			},
		);
	});
});
