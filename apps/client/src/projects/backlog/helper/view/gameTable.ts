import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { gameColumnFilterKinds } from "@citadel/specs/src/projects/backlog/helper/view/gameColumnFilterKinds";

import { gameColumnLabels } from "../label/gameColumnLabels";
import type { TableDefinition } from "./tableDefinition.type";

// Le tableau des jeux : toutes les colonnes visibles, dans l'ordre de l'enum
export const gameTable: TableDefinition<BacklogColumnEnum> = {
	kinds: gameColumnFilterKinds,
	defaultColumns: Object.values(BacklogColumnEnum).map((key) => ({
		key,
		isVisible: true,
	})),
	storageKey: "backlog.columns",
	actionsColumn: BacklogColumnEnum.ACTIONS,
	labels: gameColumnLabels,
	durationColumns: [
		BacklogColumnEnum.TRACKED_PLAY_TIME,
		BacklogColumnEnum.ESTIMATED_PLAY_TIME,
		BacklogColumnEnum.TOTAL_PLAY_TIME,
	],
};
