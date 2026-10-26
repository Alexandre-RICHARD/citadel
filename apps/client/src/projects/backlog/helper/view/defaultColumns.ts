import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";

import type { ColumnSetting } from "./columnSetting.type";

// Toutes les colonnes, visibles, dans l'ordre du cahier des charges (§7)
export const DEFAULT_COLUMNS: readonly ColumnSetting[] = Object.values(
	BacklogColumnEnum,
).map((key) => ({ key, isVisible: true }));
