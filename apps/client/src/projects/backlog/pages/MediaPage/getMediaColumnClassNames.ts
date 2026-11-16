import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum";

import styles from "../../backlog.module.scss";
import { getColumnClassNames } from "../../helper/table/getColumnClassNames";
import type { TableLayout } from "../../helper/table/tableLayout.type";

// Le tableau des films et séries : les nombres à droite, les cases et les petites valeurs au centre
const mediaLayout: TableLayout<MediaColumnEnum> = {
	thumbnailColumn: MediaColumnEnum.THUMBNAIL,
	nameColumn: MediaColumnEnum.TITLE,
	alignments: {
		[MediaColumnEnum.MEDIA_TYPE]: styles.alignCenter,
		[MediaColumnEnum.SAGA_NUMBER]: styles.alignCenter,
		[MediaColumnEnum.RUNTIME]: styles.alignEnd,
		[MediaColumnEnum.IN_PROGRESS]: styles.alignCenter,
		[MediaColumnEnum.WATCHED]: styles.alignCenter,
		[MediaColumnEnum.UP_NEXT]: styles.alignCenter,
		[MediaColumnEnum.TMDB_ID]: styles.alignEnd,
		[MediaColumnEnum.ACTIONS]: styles.alignCenter,
	},
};

// Classes de chaque colonne du tableau des films et séries (helper/table/getColumnClassNames)
export function getMediaColumnClassNames(
	columns: MediaColumnEnum[],
	isHeader: boolean,
): Partial<Record<MediaColumnEnum, string>> {
	return getColumnClassNames(mediaLayout, columns, isHeader);
}
