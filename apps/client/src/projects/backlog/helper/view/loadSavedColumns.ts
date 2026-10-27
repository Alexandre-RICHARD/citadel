import { readLocalStorage } from "@citadel/common/src/browser/storage/readLocalStorage";
import { getIsRecord } from "@citadel/common/src/universal/value/getIsRecord";
import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";

import type { ColumnSetting } from "./columnSetting.type";
import { COLUMNS_STORAGE_KEY } from "./columnsStorageKey";

function isColumnKey(value: unknown): value is BacklogColumnEnum {
	return Object.values<unknown>(BacklogColumnEnum).includes(value);
}

function readColumnSetting(saved: unknown): ColumnSetting | null {
	if (
		!getIsRecord(saved) ||
		!isColumnKey(saved.key) ||
		typeof saved.isVisible !== "boolean"
	)
		return null;
	return {
		key: saved.key,
		isVisible: saved.key === BacklogColumnEnum.ACTIONS || saved.isVisible,
	};
}

/**
 * Disposition des colonnes gardée dans le navigateur ; null si absente ou illisible.
 * Une colonne inconnue ou en double est ignorée, une nouvelle colonne s'ajoute à la fin, Actions reste visible
 */
export function loadSavedColumns(): ColumnSetting[] | null {
	const saved = readLocalStorage(COLUMNS_STORAGE_KEY);
	if (!Array.isArray(saved)) return null;
	const columns: ColumnSetting[] = [];
	for (const item of saved as unknown[]) {
		const setting = readColumnSetting(item);
		if (setting !== null && !columns.some(({ key }) => key === setting.key))
			columns.push(setting);
	}
	for (const key of Object.values(BacklogColumnEnum))
		if (!columns.some((setting) => setting.key === key))
			columns.push({ key, isVisible: true });
	return columns;
}
