import { describe, expect, it } from "vitest";

import { toLanguageCodes } from "./toLanguageCodes.ts";

describe("toLanguageCodes.ts", () => {
	describe("known languages", () => {
		it("SHOULD read the names of Radarr and the codes of Jellyfin, once each", () => {
			expect(toLanguageCodes(["French/English", "fre", null])).toStrictEqual([
				"fr",
				"en",
			]);
		});
	});

	describe("unknown languages", () => {
		it("SHOULD drop « und » and unknown names", () => {
			expect(toLanguageCodes(["und", "Klingon"])).toStrictEqual([]);
		});
	});
});
