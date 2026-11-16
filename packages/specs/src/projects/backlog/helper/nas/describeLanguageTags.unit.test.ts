import { describe, expect, it } from "vitest";

import { LanguageTagEnum } from "../../enum/languageTag.enum.ts";
import { describeLanguageTags } from "./describeLanguageTags.ts";

describe("describeLanguageTags.ts", () => {
	describe("foreign original language", () => {
		it("SHOULD give every tag WHEN the file has French and original tracks and subtitles", () => {
			expect(
				describeLanguageTags(
					{ audioLanguages: ["fr", "en"], subtitleLanguages: ["fr", "en"] },
					"en",
				),
			).toStrictEqual([
				LanguageTagEnum.VF,
				LanguageTagEnum.VO,
				LanguageTagEnum.STFR,
				LanguageTagEnum.STVO,
			]);
		});

		it("SHOULD ignore a language that is neither French nor the original one", () => {
			expect(
				describeLanguageTags(
					{ audioLanguages: ["de"], subtitleLanguages: ["es"] },
					"en",
				),
			).toStrictEqual([]);
		});
	});

	describe("French original language", () => {
		it("SHOULD give only VF and STFR WHEN the original language is French", () => {
			expect(
				describeLanguageTags(
					{ audioLanguages: ["fr"], subtitleLanguages: ["fr"] },
					"fr",
				),
			).toStrictEqual([LanguageTagEnum.VF, LanguageTagEnum.STFR]);
		});
	});

	describe("unknown languages", () => {
		it("SHOULD say unknown WHEN no audio track has a known language", () => {
			expect(
				describeLanguageTags(
					{ audioLanguages: [], subtitleLanguages: ["fr"] },
					"en",
				),
			).toStrictEqual([LanguageTagEnum.STFR, LanguageTagEnum.UNKNOWN]);
		});

		it("SHOULD give no original tag WHEN TMDB has no original language", () => {
			expect(
				describeLanguageTags(
					{ audioLanguages: ["en"], subtitleLanguages: [] },
					null,
				),
			).toStrictEqual([]);
		});
	});
});
