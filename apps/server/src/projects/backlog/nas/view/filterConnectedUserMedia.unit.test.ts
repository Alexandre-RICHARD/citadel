import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum.ts";
import { FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum.ts";
import { LanguageTagEnum } from "@citadel/specs/src/projects/backlog/enum/languageTag.enum.ts";
import { NasColumnEnum } from "@citadel/specs/src/projects/backlog/enum/nasColumn.enum.ts";
import { NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum.ts";
import { describe, expect, it } from "vitest";

import { buildConnectedUserMediaBean } from "../../../../testUtils/unit/backlog/buildConnectedUserMediaBean.ts";
import { filterConnectedUserMedia } from "./filterConnectedUserMedia.ts";

const VF_ONLY = buildConnectedUserMediaBean(1, {
	languageTags: [{ tag: LanguageTagEnum.VF, count: 1 }],
});
const VF_AND_VO = buildConnectedUserMediaBean(2, {
	languageTags: [
		{ tag: LanguageTagEnum.VF, count: 1 },
		{ tag: LanguageTagEnum.VO, count: 1 },
	],
	storage: NasStorageEnum.PRESENT,
});
const LANGUAGES = {
	column: NasColumnEnum.LANGUAGES,
	kind: ColumnFilterKindEnum.VALUE,
	values: [LanguageTagEnum.VF, LanguageTagEnum.VO],
} as const;

describe("filterConnectedUserMedia.ts", () => {
	describe("tags", () => {
		it("SHOULD keep the rows with every tag WHEN the filters are combined with and", () => {
			expect(
				filterConnectedUserMedia(
					[VF_ONLY, VF_AND_VO],
					[{ ...LANGUAGES, values: [...LANGUAGES.values] }],
					FilterModeEnum.AND,
				).map(({ id }) => id),
			).toStrictEqual([2]);
		});

		it("SHOULD keep the rows with one of the tags WHEN the filters are combined with or", () => {
			expect(
				filterConnectedUserMedia(
					[VF_ONLY, VF_AND_VO],
					[{ ...LANGUAGES, values: [...LANGUAGES.values] }],
					FilterModeEnum.OR,
				).map(({ id }) => id),
			).toStrictEqual([1, 2]);
		});
	});

	describe("states", () => {
		it("SHOULD keep the rows in the chosen storage state", () => {
			expect(
				filterConnectedUserMedia(
					[VF_ONLY, VF_AND_VO],
					[
						{
							column: NasColumnEnum.STORAGE,
							kind: ColumnFilterKindEnum.VALUE,
							values: [NasStorageEnum.PRESENT],
						},
					],
					FilterModeEnum.AND,
				).map(({ id }) => id),
			).toStrictEqual([2]);
		});
	});
});
