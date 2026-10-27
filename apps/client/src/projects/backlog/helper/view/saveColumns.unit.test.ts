import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { beforeEach, describe, expect, it } from "vitest";

import { COLUMNS_STORAGE_KEY } from "./columnsStorageKey";
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

			saveColumns(columns);

			expect(localStorage.getItem(COLUMNS_STORAGE_KEY)).not.toBeNull();
			expect(loadSavedColumns()).toStrictEqual(columns);
		});
	});
});
