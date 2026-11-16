import { NasColumnEnum } from "@citadel/specs/src/projects/backlog/enum/nasColumn.enum";
import type { ConnectedMediaColumn } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumn.type";

const NAS_COLUMNS: readonly string[] = Object.values(NasColumnEnum);

// Une colonne relevée sur le NAS (mode connecté), et non une colonne commune aux deux modes
export function isNasColumn(
	column: ConnectedMediaColumn,
): column is NasColumnEnum {
	return NAS_COLUMNS.includes(column);
}
