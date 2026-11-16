import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { beforeEach, describe, expect, it } from "vitest";

import { gameTable } from "./gameTable";
import { loadSavedColumns } from "./loadSavedColumns";
import { saveColumns } from "./saveColumns";

describe("saveColumns.ts", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	describe("layout", () => {
		it("SHOULD keep the layout in the browser, readable by loadSavedColumns", () => {
			const columns = Object.values(BacklogColumnEnum).map((key) => ({
				key,
				isVisible: key !== BacklogColumnEnum.COMMENT,
			}));

			saveColumns(gameTable, columns);

			expect(localStorage.getItem(gameTable.storageKey)).not.toBeNull();
			expect(loadSavedColumns(gameTable)).toStrictEqual(columns);
		});
	});
});
