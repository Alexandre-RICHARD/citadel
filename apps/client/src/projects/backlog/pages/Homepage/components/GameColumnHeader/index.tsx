import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";
import { statusRanks } from "@citadel/specs/src/projects/backlog/helper/status/statusRanks";
import type { SortCriterion } from "@citadel/specs/src/projects/backlog/helper/view/sortCriterion.type";
import { Bookmark, ImageIcon, PackageCheck, Play, Timer } from "lucide-react";
import type { ReactNode } from "react";

import styles from "../../../../backlog.module.scss";
import { endingTypeLabels } from "../../../../helper/label/endingTypeLabels";
import { noEndingTypeLabel } from "../../../../helper/label/noEndingTypeLabel";
import { statusDescriptions } from "../../../../helper/status/statusDescriptions";
import { gameTable } from "../../../../helper/view/gameTable";
import { isSortableColumn } from "../../../../helper/view/isSortableColumn";
import { ColumnHeader } from "../ColumnHeader";
import type { CompactHeader } from "../ColumnHeader/compactHeader.type";
import { EndingTypeLabel } from "../EndingTypeLabel";
import { StatusBadge } from "../StatusBadge";

// Bulles explicatives des en-têtes : la signification des valeurs
const columnHelp: Partial<Record<BacklogColumnEnum, ReactNode>> = {
	[BacklogColumnEnum.ENDING_TYPE]: (
		<dl className={styles.helpList}>
			{Object.values(EndingTypeEnum).map((endingType) => (
				<div key={endingType}>
					<dt>
						<EndingTypeLabel endingType={endingType} />
					</dt>
					<dd>{endingTypeLabels[endingType].meaning}</dd>
				</div>
			))}
			<div>
				<dt>
					<EndingTypeLabel endingType={null} />
				</dt>
				<dd>{noEndingTypeLabel.meaning}</dd>
			</div>
		</dl>
	),
	[BacklogColumnEnum.STATUS]: (
		<dl className={styles.helpList}>
			{Object.values(StatusEnum).map((status) => (
				<div key={status}>
					<dt>
						<span className={styles.helpRank}>{statusRanks[status]}</span>
						<StatusBadge status={status} />
					</dt>
					<dd>{statusDescriptions[status].meaning}</dd>
				</div>
			))}
		</dl>
	),
};

/**
 * En-têtes compacts, pour un tableau moins large : une icône ou un mot à la place d'un libellé bien plus large que les
 * valeurs. Le libellé complet reste dans l'info-bulle et pour les lecteurs d'écran
 */
const compactHeaders: Partial<Record<BacklogColumnEnum, CompactHeader>> = {
	[BacklogColumnEnum.THUMBNAIL]: { icon: ImageIcon },
	[BacklogColumnEnum.SERIES_NUMBER]: { text: "N°" },
	[BacklogColumnEnum.RELEASE_DATE]: { text: "Sortie" },
	[BacklogColumnEnum.IN_PROGRESS]: { icon: Play },
	[BacklogColumnEnum.UP_NEXT]: { icon: Bookmark },
	[BacklogColumnEnum.OWNED]: { icon: PackageCheck },
	[BacklogColumnEnum.TRACKED_PLAY_TIME]: { icon: Timer, text: "Relevé" },
	[BacklogColumnEnum.ESTIMATED_PLAY_TIME]: { icon: Timer, text: "Estimé" },
	[BacklogColumnEnum.TOTAL_PLAY_TIME]: { icon: Timer, text: "Total" },
	[BacklogColumnEnum.ACTIONS]: {},
};

type Props = {
	column: BacklogColumnEnum;
	sort: SortCriterion[];
	className: string | undefined;
	onToggleSort: (column: BacklogColumnEnum) => void;
};

// En-tête d'une colonne du tableau des jeux
export function GameColumnHeader({
	column,
	sort,
	className,
	onToggleSort,
}: Props) {
	return (
		<ColumnHeader
			column={column}
			label={gameTable.labels[column]}
			compactHeader={compactHeaders[column]}
			help={columnHelp[column]}
			isSortable={isSortableColumn(gameTable, column)}
			sort={sort}
			className={className}
			onToggleSort={onToggleSort}
		/>
	);
}
