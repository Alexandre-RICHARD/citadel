import type { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";

import type { ColumnSetting } from "./columnSetting.type";

// Échange une colonne avec sa voisine ; sans voisine de ce côté, rien ne bouge
export function moveColumn(
	columns: readonly ColumnSetting[],
	key: BacklogColumnEnum,
	offset: -1 | 1,
): ColumnSetting[] {
	const index = columns.findIndex((setting) => setting.key === key);
	const target = index + offset;
	const moved = [...columns];
	const current = moved[index];
	const neighbour = moved[target];
	if (index === -1 || current === undefined || neighbour === undefined)
		return moved;
	moved[index] = neighbour;
	moved[target] = current;
	return moved;
}
