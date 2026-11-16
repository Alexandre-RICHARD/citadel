import { readLocalStorage } from "@citadel/common/src/browser/storage/readLocalStorage";
import { getIsRecord } from "@citadel/common/src/universal/value/getIsRecord";

import type { ColumnSetting } from "./columnSetting.type";
import type { TableDefinition } from "./tableDefinition.type";

function readColumnSetting<Column extends string>(
	table: TableDefinition<Column>,
	saved: unknown,
): ColumnSetting<Column> | null {
	if (
		!getIsRecord(saved) ||
		typeof saved.key !== "string" ||
		!Object.hasOwn(table.kinds, saved.key) ||
		typeof saved.isVisible !== "boolean"
	)
		return null;
	const key = saved.key as Column;
	return {
		key,
		isVisible: key === table.actionsColumn || saved.isVisible,
	};
}

/**
 * Disposition des colonnes d'un tableau gardée dans le navigateur ; null si absente ou illisible.
 * Une colonne inconnue ou en double est ignorée, une nouvelle colonne se place derrière celle qui la précède par défaut,
 * avec sa visibilité par défaut ; Actions reste visible
 */
export function loadSavedColumns<Column extends string>(
	table: TableDefinition<Column>,
): ColumnSetting<Column>[] | null {
	const saved = readLocalStorage(table.storageKey);
	if (!Array.isArray(saved)) return null;
	const columns: ColumnSetting<Column>[] = [];
	for (const item of saved as unknown[]) {
		const setting = readColumnSetting(table, item);
		if (setting !== null && !columns.some(({ key }) => key === setting.key))
			columns.push(setting);
	}
	for (const [index, defaultSetting] of table.defaultColumns.entries())
		if (!columns.some((setting) => setting.key === defaultSetting.key)) {
			const previousKey = table.defaultColumns[index - 1]?.key;
			const previousIndex = columns.findIndex(
				(setting) => setting.key === previousKey,
			);
			// Sans colonne qui la précède dans la disposition gardée, elle passe à la fin
			columns.splice(
				previousIndex === -1 ? columns.length : previousIndex + 1,
				0,
				{ ...defaultSetting },
			);
		}
	return columns;
}
