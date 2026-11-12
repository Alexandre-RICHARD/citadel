import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { beforeEach, describe, expect, it } from "vitest";

import { COLUMNS_STORAGE_KEY } from "./columnsStorageKey";
import { loadSavedColumns } from "./loadSavedColumns";

function save(value: unknown): void {
	localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(value));
}

describe("loadSavedColumns.ts", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	describe("saved layout", () => {
		it("SHOULD keep the saved order, then add the other columns visible", () => {
			save([
				{ key: BacklogColumnEnum.RATING, isVisible: false },
				{ key: BacklogColumnEnum.NAME, isVisible: true },
			]);

			const columns = loadSavedColumns();

			expect(columns?.[0]).toStrictEqual({
				key: BacklogColumnEnum.RATING,
				isVisible: false,
			});
			expect(
				columns?.findIndex(({ key }) => key === BacklogColumnEnum.NAME),
			).toBeGreaterThan(0);
			expect(columns).toHaveLength(Object.values(BacklogColumnEnum).length);
		});

		it("SHOULD place a column missing from the saved layout behind the one that precedes it by default", () => {
			save(
				Object.values(BacklogColumnEnum)
					.filter((key) => key !== BacklogColumnEnum.IN_PROGRESS)
					.map((key) => ({ key, isVisible: key !== BacklogColumnEnum.RATING })),
			);

			const keys = loadSavedColumns()?.map(({ key }) => key);

			expect(keys?.indexOf(BacklogColumnEnum.IN_PROGRESS)).toBe(
				(keys?.indexOf(BacklogColumnEnum.STATUS) ?? 0) + 1,
			);
		});

		it("SHOULD ignore unknown, invalid and repeated columns", () => {
			save([
				{ key: "oldColumn", isVisible: true },
				{ key: BacklogColumnEnum.NAME, isVisible: "yes" },
				{ key: BacklogColumnEnum.RATING, isVisible: false },
				{ key: BacklogColumnEnum.RATING, isVisible: true },
				null,
			]);

			const columns = loadSavedColumns();

			expect(columns?.[0]).toStrictEqual({
				key: BacklogColumnEnum.RATING,
				isVisible: false,
			});
			expect(
				columns?.filter(({ key }) => key === BacklogColumnEnum.RATING),
			).toHaveLength(1);
		});

		it("SHOULD keep the actions visible WHEN they were saved hidden", () => {
			save([{ key: BacklogColumnEnum.ACTIONS, isVisible: false }]);

			expect(loadSavedColumns()?.[0]).toStrictEqual({
				key: BacklogColumnEnum.ACTIONS,
				isVisible: true,
			});
		});
	});

	describe("no layout", () => {
		it("SHOULD return null WHEN nothing is saved", () => {
			expect(loadSavedColumns()).toBeNull();
		});

		it("SHOULD return null WHEN the saved value is not a list", () => {
			save({ columns: [] });

			expect(loadSavedColumns()).toBeNull();
		});
	});
});
