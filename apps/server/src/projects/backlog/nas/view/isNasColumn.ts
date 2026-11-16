import { NasColumnEnum } from "@citadel/specs/src/projects/backlog/enum/nasColumn.enum.ts";
import type { ConnectedMediaColumn } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumn.type.ts";

const NAS_COLUMNS: readonly string[] = Object.values(NasColumnEnum);

export function isNasColumn(
	column: ConnectedMediaColumn,
): column is NasColumnEnum {
	return NAS_COLUMNS.includes(column);
}
