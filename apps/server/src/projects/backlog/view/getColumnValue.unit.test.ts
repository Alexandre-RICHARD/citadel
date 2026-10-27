import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum.ts";
import { describe, expect, it } from "vitest";

import { buildViewRow } from "../../../testUtils/unit/backlog/buildViewRow.ts";
import { getColumnValue } from "./getColumnValue.ts";

describe("getColumnValue.ts", () => {
	describe("shown values", () => {
		it("SHOULD show the French name in the name column WHEN there is one", () => {
			expect(
				getColumnValue(
					BacklogColumnEnum.NAME,
					buildViewRow({ name: "Pikmin", frenchName: "Pikmin VF" }),
				),
			).toBe("Pikmin VF");
		});

		it("SHOULD show the original name WHEN there is no French name", () => {
			expect(
				getColumnValue(
					BacklogColumnEnum.NAME,
					buildViewRow({ name: "Pikmin" }),
				),
			).toBe("Pikmin");
		});

		it("SHOULD show the done DLCs WHEN the game has DLCs", () => {
			expect(
				getColumnValue(
					BacklogColumnEnum.DLC,
					buildViewRow({ dlcCount: 3, doneDlcCount: 1 }),
				),
			).toBe(1);
		});

		it("SHOULD read the matching field of the row", () => {
			expect(
				getColumnValue(BacklogColumnEnum.RATING, buildViewRow({ rating: 17 })),
			).toBe(17);
		});
	});

	describe("empty cells", () => {
		it.each([
			{ reason: "the game has no DLC", column: BacklogColumnEnum.DLC },
			{
				reason: "the column shows a thumbnail",
				column: BacklogColumnEnum.THUMBNAIL,
			},
			{ reason: "the column shows actions", column: BacklogColumnEnum.ACTIONS },
		])("SHOULD return null WHEN $reason", ({ column }) => {
			expect(getColumnValue(column, buildViewRow())).toBeNull();
		});
	});
});
