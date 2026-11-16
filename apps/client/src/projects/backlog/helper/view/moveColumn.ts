import { swapItems } from "@citadel/common/src/universal/array/swapItems";

import type { ColumnSetting } from "./columnSetting.type";

// Échange une colonne avec sa voisine ; sans voisine de ce côté, rien ne bouge
export function moveColumn<Column extends string>(
	columns: readonly ColumnSetting<Column>[],
	key: Column,
	offset: -1 | 1,
): ColumnSetting<Column>[] {
	const index = columns.findIndex((setting) => setting.key === key);
	return index === -1
		? [...columns]
		: swapItems(columns, index, index + offset);
}
