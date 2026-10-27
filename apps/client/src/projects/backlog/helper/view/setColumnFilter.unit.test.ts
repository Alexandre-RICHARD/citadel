import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type";
import { describe, expect, it } from "vitest";

import { setColumnFilter } from "./setColumnFilter";

const NAME_FILTER: ColumnFilter = {
	column: BacklogColumnEnum.NAME,
	kind: ColumnFilterKindEnum.TEXT,
	text: "zelda",
	isExact: false,
};
const OWNED_FILTER: ColumnFilter = {
	column: BacklogColumnEnum.OWNED,
	kind: ColumnFilterKindEnum.BOOLEAN,
	value: true,
};

describe("setColumnFilter.ts", () => {
	describe("new filter", () => {
		it("SHOULD add the filter at the end WHEN the column has none", () => {
			expect(
				setColumnFilter([NAME_FILTER], BacklogColumnEnum.OWNED, OWNED_FILTER),
			).toStrictEqual([NAME_FILTER, OWNED_FILTER]);
		});

		it("SHOULD replace the filter in place WHEN the column already has one", () => {
			const marioFilter: ColumnFilter = { ...NAME_FILTER, text: "mario" };

			expect(
				setColumnFilter(
					[NAME_FILTER, OWNED_FILTER],
					BacklogColumnEnum.NAME,
					marioFilter,
				),
			).toStrictEqual([marioFilter, OWNED_FILTER]);
		});
	});

	describe("removed filter", () => {
		it("SHOULD remove the filter of the column WHEN the new filter is null", () => {
			expect(
				setColumnFilter(
					[NAME_FILTER, OWNED_FILTER],
					BacklogColumnEnum.NAME,
					null,
				),
			).toStrictEqual([OWNED_FILTER]);
		});
	});
});
