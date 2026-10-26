import type { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";

import type { ColumnSetting } from "./columnSetting.type";

// Une colonne masquée sort du tri et des filtres (cahier des charges, §9)
export function keepVisibleColumns<Item extends { column: BacklogColumnEnum }>(
	items: Item[],
	columns: readonly ColumnSetting[],
): Item[] {
	return items.filter(({ column }) =>
		columns.some((setting) => setting.key === column && setting.isVisible),
	);
}
