import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { SortDirectionEnum } from "@citadel/specs/src/projects/backlog/enum/sortDirection.enum";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";
import { statusRanks } from "@citadel/specs/src/projects/backlog/rule/status/statusRanks";
import type { SortCriterion } from "@citadel/specs/src/projects/backlog/rule/view/sortCriterion.type";
import {
	ArrowDown,
	ArrowUp,
	Bookmark,
	ImageIcon,
	Info,
	type LucideIcon,
	PackageCheck,
	Timer,
} from "lucide-react";
import type { ReactNode } from "react";

import styles from "../../../../backlog.module.scss";
import { Tooltip } from "../../../../components/Tooltip";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import { columnLabels } from "../../../../helper/label/columnLabels";
import { endingTypeLabels } from "../../../../helper/label/endingTypeLabels";
import { statusLabels } from "../../../../helper/label/statusLabels";
import { isSortableColumn } from "../../../../helper/view/isSortableColumn";
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
		</dl>
	),
	[BacklogColumnEnum.STATUS]: (
		<dl className={styles.helpList}>
			{Object.values(StatusEnum).map((status) => (
				<div key={status}>
					<dt>
						<span className={styles.helpRank}>
							{statusRanks[status] ?? "–"}
						</span>
						<StatusBadge status={status} />
					</dt>
					<dd>{statusLabels[status].meaning}</dd>
				</div>
			))}
		</dl>
	),
};

/**
 * En-têtes compacts, pour un tableau moins large : une icône ou un mot à la place d'un libellé bien plus large que les
 * valeurs. Le libellé complet reste dans l'info-bulle et pour les lecteurs d'écran
 */
const compactHeaders: Partial<
	Record<BacklogColumnEnum, { icon?: LucideIcon; text?: string }>
> = {
	[BacklogColumnEnum.THUMBNAIL]: { icon: ImageIcon },
	[BacklogColumnEnum.SERIES_NUMBER]: { text: "N°" },
	[BacklogColumnEnum.RELEASE_DATE]: { text: "Sortie" },
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

// En-tête : un clic trie (croissant, décroissant, puis sans tri), avec la flèche et le numéro de priorité du critère
export function ColumnHeader({ column, sort, className, onToggleSort }: Props) {
	const help = columnHelp[column];
	const label = columnLabels[column];
	const compactHeader = compactHeaders[column];
	const priority = sort.findIndex((criterion) => criterion.column === column);
	const criterion = sort.at(priority);
	const isSorted = priority !== -1 && criterion !== undefined;
	const isAscending = criterion?.direction === SortDirectionEnum.ASC;
	let ariaSort: "ascending" | "descending" | undefined;
	if (isSorted) ariaSort = isAscending ? "ascending" : "descending";
	const HeaderIcon = compactHeader?.icon;
	const content = (
		<>
			{HeaderIcon !== undefined && (
				<HeaderIcon
					className={styles.headerIcon}
					aria-hidden
				/>
			)}
			{compactHeader === undefined ? label : compactHeader.text}
		</>
	);

	return (
		<th
			scope="col"
			aria-sort={ariaSort}
			className={className}
		>
			<span className={styles.headerContent}>
				{isSortableColumn(column) ? (
					<Tooltip
						content={`${label}\nTrier : croissant, puis décroissant, puis sans tri`}
						placement="bottom"
					>
						<button
							type="button"
							className={joinClassNames(
								styles.sortButton,
								isSorted && styles.sortedColumn,
							)}
							aria-label={label}
							onClick={() => onToggleSort(column)}
						>
							{content}
							{isSorted && (
								<span className={styles.sortIndicator}>
									{isAscending ? (
										<ArrowUp aria-hidden />
									) : (
										<ArrowDown aria-hidden />
									)}
									<span className={styles.sortPriority}>{priority + 1}</span>
								</span>
							)}
						</button>
					</Tooltip>
				) : (
					<Tooltip
						content={compactHeader === undefined ? null : label}
						placement="bottom"
					>
						<span className={styles.staticHeader}>
							{content}
							{compactHeader !== undefined && (
								<span className={styles.visuallyHidden}>{label}</span>
							)}
						</span>
					</Tooltip>
				)}
				{help !== undefined && (
					<Tooltip
						content={help}
						placement="bottom"
						isWide
					>
						<button
							type="button"
							className={styles.helpButton}
							aria-label={`Signification : ${label}`}
						>
							<Info aria-hidden />
						</button>
					</Tooltip>
				)}
			</span>
		</th>
	);
}
