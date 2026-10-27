import { describe, expect, it } from "vitest";

import { describeGameDeletion } from "./describeGameDeletion";

describe("describeGameDeletion.ts", () => {
	describe("deaths of the game", () => {
		it.each([
			{ totalDeath: 0, expected: "Ses boss seront supprimés définitivement." },
			{
				totalDeath: 1,
				expected: "Ses boss et sa mort seront supprimés définitivement.",
			},
			{
				totalDeath: 12,
				expected: "Ses boss et ses 12 morts seront supprimés définitivement.",
			},
		])(
			"SHOULD announce $expected WHEN the game has $totalDeath deaths",
			({ totalDeath, expected }) => {
				expect(describeGameDeletion(totalDeath)).toBe(expected);
			},
		);
	});
});
