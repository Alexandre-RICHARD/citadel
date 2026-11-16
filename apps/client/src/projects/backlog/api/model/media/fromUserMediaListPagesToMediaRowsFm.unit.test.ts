import { describe, expect, it } from "vitest";

import { buildUserMediaDto } from "../../testUtils/buildUserMediaDto";
import { buildUserMediaListData } from "../../testUtils/buildUserMediaListData";
import { fromUserMediaListPagesToMediaRowsFm } from "./fromUserMediaListPagesToMediaRowsFm";

const COUNTS = { matchedCount: 2, movieCount: 1, showCount: 1 };

describe("fromUserMediaListPagesToMediaRowsFm.ts", () => {
	describe("pages", () => {
		it("SHOULD give no row WHEN the backlog is empty", () => {
			expect(
				fromUserMediaListPagesToMediaRowsFm(
					buildUserMediaListData([null], COUNTS),
				),
			).toStrictEqual({
				rows: [],
				matchedCount: 0,
				movieCount: 0,
				showCount: 0,
				originalLanguages: [],
			});
		});

		it("SHOULD keep a media once WHEN it comes back on a later page", () => {
			const rows = fromUserMediaListPagesToMediaRowsFm(
				buildUserMediaListData(
					[
						[buildUserMediaDto(1)],
						[buildUserMediaDto(1), buildUserMediaDto(2)],
					],
					COUNTS,
				),
			);
			expect(rows.rows.map(({ userMediaId }) => userMediaId)).toStrictEqual([
				1, 2,
			]);
			expect(rows.originalLanguages).toStrictEqual(["en"]);
		});
	});
});
