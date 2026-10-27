import { swapItems } from "@citadel/common/src/universal/array/swapItems";
import type { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";

import type { ColumnSetting } from "./columnSetting.type";

// Échange une colonne avec sa voisine ; sans voisine de ce côté, rien ne bouge
export function moveColumn(
	columns: readonly ColumnSetting[],
	key: BacklogColumnEnum,
	offset: -1 | 1,
): ColumnSetting[] {
	const index = columns.findIndex((setting) => setting.key === key);
	return index === -1
		? [...columns]
		: swapItems(columns, index, index + offset);
}
