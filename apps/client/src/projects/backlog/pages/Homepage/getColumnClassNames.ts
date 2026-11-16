import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";

import styles from "../../backlog.module.scss";
import { getColumnClassNames as getTableColumnClassNames } from "../../helper/table/getColumnClassNames";
import type { TableLayout } from "../../helper/table/tableLayout.type";

// Le tableau des jeux : les nombres à droite, les cases et les petites valeurs au centre
const gameLayout: TableLayout<BacklogColumnEnum> = {
	thumbnailColumn: BacklogColumnEnum.THUMBNAIL,
	nameColumn: BacklogColumnEnum.NAME,
	alignments: {
		[BacklogColumnEnum.SERIES_NUMBER]: styles.alignCenter,
		[BacklogColumnEnum.IN_PROGRESS]: styles.alignCenter,
		[BacklogColumnEnum.UP_NEXT]: styles.alignCenter,
		[BacklogColumnEnum.OWNED]: styles.alignCenter,
		[BacklogColumnEnum.FINISH_COUNT]: styles.alignEnd,
		[BacklogColumnEnum.DLC]: styles.alignCenter,
		[BacklogColumnEnum.TRACKED_PLAY_TIME]: styles.alignEnd,
		[BacklogColumnEnum.ESTIMATED_PLAY_TIME]: styles.alignEnd,
		[BacklogColumnEnum.TOTAL_PLAY_TIME]: styles.alignEnd,
		[BacklogColumnEnum.RATING]: styles.alignCenter,
		[BacklogColumnEnum.ACTIONS]: styles.alignCenter,
	},
};

// Classes de chaque colonne du tableau des jeux (components/Table/getColumnClassNames)
export function getColumnClassNames(
	columns: BacklogColumnEnum[],
	isHeader: boolean,
): Partial<Record<BacklogColumnEnum, string>> {
	return getTableColumnClassNames(gameLayout, columns, isHeader);
}
