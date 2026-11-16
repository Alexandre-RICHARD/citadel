import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import { SortDirectionEnum } from "@citadel/specs/src/projects/backlog/enum/sortDirection.enum";
import type { SortCriterion } from "@citadel/specs/src/projects/backlog/helper/view/sortCriterion.type";
import { ArrowDown, ArrowUp, Info } from "lucide-react";
import type { ReactNode } from "react";

import styles from "../../../../backlog.module.scss";
import { Tooltip } from "../../../../components/Tooltip";
import type { CompactHeader } from "./compactHeader.type";

type Props<Column extends string> = {
	column: Column;
	label: string;
	// Une icône ou un mot à la place du libellé ; undefined : le libellé complet
	compactHeader: CompactHeader | undefined;
	// Bulle explicative : la signification des valeurs
	help: ReactNode | undefined;
	isSortable: boolean;
	sort: SortCriterion<Column>[];
	className: string | undefined;
	onToggleSort: (column: Column) => void;
};

// En-tête : un clic trie (croissant, décroissant, puis sans tri), avec la flèche et le numéro de priorité du critère
export function ColumnHeader<Column extends string>({
	column,
	label,
	compactHeader,
	help,
	isSortable,
	sort,
	className,
	onToggleSort,
}: Props<Column>) {
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
				{isSortable ? (
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
