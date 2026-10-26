import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";

import type { ColumnSetting } from "./columnSetting.type";
import { COLUMNS_STORAGE_KEY } from "./columnsStorageKey";

function isColumnKey(value: unknown): value is BacklogColumnEnum {
	return Object.values<unknown>(BacklogColumnEnum).includes(value);
}

/**
 * Disposition des colonnes gardée dans le navigateur ; null si absente ou illisible.
 * Une colonne inconnue est ignorée, une nouvelle colonne s'ajoute à la fin, Actions reste visible
 */
export function loadSavedColumns(): ColumnSetting[] | null {
	try {
		const saved: unknown = JSON.parse(
			window.localStorage.getItem(COLUMNS_STORAGE_KEY) ?? "null",
		);
		if (!Array.isArray(saved)) return null;

		const columns: ColumnSetting[] = [];
		for (const item of saved as unknown[])
			if (
				typeof item === "object" &&
				item !== null &&
				"key" in item &&
				"isVisible" in item &&
				isColumnKey(item.key) &&
				typeof item.isVisible === "boolean" &&
				!columns.some(({ key }) => key === item.key)
			)
				columns.push({
					key: item.key,
					isVisible: item.key === BacklogColumnEnum.ACTIONS || item.isVisible,
				});
		for (const key of Object.values(BacklogColumnEnum))
			if (!columns.some((setting) => setting.key === key))
				columns.push({ key, isVisible: true });
		return columns;
	} catch {
		return null;
	}
}
