import { describe, expect, it } from "vitest";

import { buildVerificationKey } from "./buildVerificationKey.ts";
import { parseVerificationKey } from "./parseVerificationKey.ts";

describe("parseVerificationKey.ts", () => {
	describe("readable keys", () => {
		it.each([
			{ kind: "movie" as const, tmdbId: 603 },
			{
				kind: "episode" as const,
				showTmdbId: 1396,
				seasonNumber: 2,
				episodeNumber: 5,
			},
		])("SHOULD read back the key of a $kind", (target) => {
			expect(parseVerificationKey(buildVerificationKey(target))).toStrictEqual(
				target,
			);
		});
	});

	describe("unreadable keys", () => {
		it.each(["movie:", "show:12", "episode:1:2", "movie:12:3"])(
			"SHOULD give nothing WHEN the key is %s",
			(key) => {
				expect(parseVerificationKey(key)).toBeNull();
			},
		);
	});
});
