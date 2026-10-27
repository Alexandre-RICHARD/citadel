import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { describe, expect, it } from "vitest";

import { keepVisibleColumns } from "./keepVisibleColumns";

const COLUMNS = [
	{ key: BacklogColumnEnum.NAME, isVisible: true },
	{ key: BacklogColumnEnum.RATING, isVisible: false },
];

describe("keepVisibleColumns.ts", () => {
	describe("columns", () => {
		it("SHOULD keep only the items of visible columns, in their order", () => {
			expect(
				keepVisibleColumns(
					[
						{ column: BacklogColumnEnum.RATING },
						{ column: BacklogColumnEnum.NAME },
						{ column: BacklogColumnEnum.COMMENT },
					],
					COLUMNS,
				),
			).toStrictEqual([{ column: BacklogColumnEnum.NAME }]);
		});
	});
});
