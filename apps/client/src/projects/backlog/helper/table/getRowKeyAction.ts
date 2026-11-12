import type { RowKeyAction } from "./rowKeyAction.type";

// ↑ ↓ changent de ligne, Entrée déplie ou replie une ligne à plusieurs versions jouées, Suppr retire. null : la touche ne fait rien
export function getRowKeyAction(
	key: string,
	isExpandable: boolean,
): RowKeyAction | null {
	if (key === "ArrowUp") return "previousRow";
	if (key === "ArrowDown") return "nextRow";
	if (key === "Enter" && isExpandable) return "toggleExpanded";
	if (key === "Delete") return "remove";
	return null;
}
