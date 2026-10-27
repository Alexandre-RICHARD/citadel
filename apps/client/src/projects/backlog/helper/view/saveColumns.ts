import { writeLocalStorage } from "@citadel/common/src/browser/storage/writeLocalStorage";

import type { ColumnSetting } from "./columnSetting.type";
import { COLUMNS_STORAGE_KEY } from "./columnsStorageKey";

export function saveColumns(columns: readonly ColumnSetting[]): void {
	writeLocalStorage(COLUMNS_STORAGE_KEY, columns);
}
