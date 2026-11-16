import { writeLocalStorage } from "@citadel/common/src/browser/storage/writeLocalStorage";

import type { ColumnSetting } from "./columnSetting.type";
import type { TableDefinition } from "./tableDefinition.type";

export function saveColumns<Column extends string>(
	table: TableDefinition<Column>,
	columns: readonly ColumnSetting<Column>[],
): void {
	writeLocalStorage(table.storageKey, columns);
}
