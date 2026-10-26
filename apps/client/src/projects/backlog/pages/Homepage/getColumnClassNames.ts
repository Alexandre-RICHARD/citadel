import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";

import styles from "../../backlog.module.scss";
import { joinClassNames } from "../../helper/dom/joinClassNames";

// Alignement des colonnes : les nombres à droite, les cases et les petites valeurs au centre
const columnAlignments: Partial<Record<BacklogColumnEnum, string | undefined>> =
	{
		[BacklogColumnEnum.SERIES_NUMBER]: styles.alignCenter,
		[BacklogColumnEnum.UP_NEXT]: styles.alignCenter,
		[BacklogColumnEnum.OWNED]: styles.alignCenter,
		[BacklogColumnEnum.FINISH_COUNT]: styles.alignEnd,
		[BacklogColumnEnum.DLC]: styles.alignCenter,
		[BacklogColumnEnum.TRACKED_PLAY_TIME]: styles.alignEnd,
		[BacklogColumnEnum.ESTIMATED_PLAY_TIME]: styles.alignEnd,
		[BacklogColumnEnum.TOTAL_PLAY_TIME]: styles.alignEnd,
		[BacklogColumnEnum.RATING]: styles.alignCenter,
		[BacklogColumnEnum.ACTIONS]: styles.alignCenter,
	};

/**
 * Classes de chaque colonne : son alignement, et sa place si elle colle au défilement horizontal (le nom, et la miniature
 * quand elle le précède, calés après la colonne du chevron). `isHeader` : l'en-tête n'a pas le format de la miniature
 */
export function getColumnClassNames(
	columns: BacklogColumnEnum[],
	isHeader: boolean,
): Partial<Record<BacklogColumnEnum, string>> {
	const nameIndex = columns.indexOf(BacklogColumnEnum.NAME);
	const thumbnailIndex = columns.indexOf(BacklogColumnEnum.THUMBNAIL);
	const isThumbnailSticky =
		thumbnailIndex !== -1 && (nameIndex === -1 || thumbnailIndex < nameIndex);
	return Object.fromEntries(
		columns.map((column) => {
			let stickyClassName: string | undefined;
			if (column === BacklogColumnEnum.THUMBNAIL && isThumbnailSticky)
				stickyClassName = joinClassNames(
					styles.stickyCell,
					styles.stickyThumbnail,
					nameIndex === -1 && styles.stickyEdge,
				);
			else if (column === BacklogColumnEnum.NAME)
				stickyClassName = joinClassNames(
					styles.stickyCell,
					isThumbnailSticky
						? styles.stickyNameAfterThumbnail
						: styles.stickyName,
					styles.stickyEdge,
				);
			return [
				column,
				joinClassNames(
					columnAlignments[column],
					stickyClassName,
					!isHeader &&
						column === BacklogColumnEnum.THUMBNAIL &&
						styles.thumbnailCell,
				),
			];
		}),
	);
}
