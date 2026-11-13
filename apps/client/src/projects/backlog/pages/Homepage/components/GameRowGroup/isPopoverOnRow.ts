import type { BacklogRowFm } from "../../../../api/model/backlogRowFm.type";
import type { TablePopover } from "../../tablePopover.type";

// Le panneau ouvert est-il celui d'une cellule de cette ligne : son menu Actions, ou les DLC d'une de ses versions jouées
export function isPopoverOnRow(
	popover: TablePopover | null,
	row: BacklogRowFm,
): boolean {
	if (popover === null) return false;
	return popover.kind === "actionsMenu"
		? popover.gameId === row.gameId
		: row.userVersionRows.some(
				({ userVersionId }) => userVersionId === popover.userVersionId,
			);
}
