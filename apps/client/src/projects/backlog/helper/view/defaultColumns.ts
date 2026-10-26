import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";

import type { ColumnSetting } from "./columnSetting.type";

// Toutes les colonnes, visibles, dans l'ordre de l'enum
export const DEFAULT_COLUMNS: readonly ColumnSetting[] = Object.values(
	BacklogColumnEnum,
).map((key) => ({ key, isVisible: true }));
