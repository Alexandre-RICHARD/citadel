import type { ColumnSetting } from "./columnSetting.type";
import { COLUMNS_STORAGE_KEY } from "./columnsStorageKey";

export function saveColumns(columns: readonly ColumnSetting[]): void {
	try {
		window.localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(columns));
	} catch {
		// Stockage indisponible (navigation privée…) : la disposition ne sera pas gardée
	}
}
