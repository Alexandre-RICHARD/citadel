import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";

import type { ColumnSetting } from "./columnSetting.type";

// La colonne Actions reste visible : sans elle, plus de menu
export function toggleColumnVisibility(
	columns: readonly ColumnSetting[],
	key: BacklogColumnEnum,
): ColumnSetting[] {
	if (key === BacklogColumnEnum.ACTIONS) return [...columns];
	return columns.map((setting) =>
		setting.key === key
			? { ...setting, isVisible: !setting.isVisible }
			: setting,
	);
}
