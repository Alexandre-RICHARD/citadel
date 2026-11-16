import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";

import styles from "../../backlog.module.scss";
import type { TableLayout } from "./tableLayout.type";

/**
 * Classes de chaque colonne d'un tableau : son alignement, et sa place si elle colle au défilement horizontal (le nom, et
 * la miniature quand elle le précède, calés après la colonne du chevron). `isHeader` : l'en-tête n'a pas le format de la
 * miniature
 */
export function getColumnClassNames<Column extends string>(
	layout: TableLayout<Column>,
	columns: Column[],
	isHeader: boolean,
): Partial<Record<Column, string>> {
	const nameIndex = columns.indexOf(layout.nameColumn);
	const thumbnailIndex = columns.indexOf(layout.thumbnailColumn);
	const isThumbnailSticky =
		thumbnailIndex !== -1 && (nameIndex === -1 || thumbnailIndex < nameIndex);
	return Object.fromEntries(
		columns.map((column) => {
			let stickyClassName: string | undefined;
			if (column === layout.thumbnailColumn && isThumbnailSticky)
				stickyClassName = joinClassNames(
					styles.stickyCell,
					styles.stickyThumbnail,
					nameIndex === -1 && styles.stickyEdge,
				);
			else if (column === layout.nameColumn)
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
					layout.alignments[column],
					stickyClassName,
					!isHeader &&
						column === layout.thumbnailColumn &&
						styles.thumbnailCell,
				),
			];
		}),
	) as Partial<Record<Column, string>>;
}
