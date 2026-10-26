import type { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { columnFilterKinds } from "@citadel/specs/src/projects/backlog/rule/view/columnFilterKinds";

// La miniature et les actions n'ont ni tri ni filtre
export function isSortableColumn(column: BacklogColumnEnum): boolean {
	return columnFilterKinds[column] !== null;
}
