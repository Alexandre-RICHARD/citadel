import type { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/rule/view/columnFilter.type";

import styles from "../../../../backlog.module.scss";
import { DateField } from "../../../../components/DateField";
import { formatIsoDate } from "../../../../helper/date/formatIsoDate";
import { formatRangeSummary } from "../../../../helper/format/formatRangeSummary";
import { FormField } from "../FormField";
import { RangeFilter } from "../RangeFilter";

type Props = {
	column: BacklogColumnEnum;
	filter: Extract<
		ColumnFilter,
		{ kind: ColumnFilterKindEnum.DATE_RANGE }
	> | null;
	label: string;
	onChange: (filter: ColumnFilter | null) => void;
};

// Dates de début et de fin, incluses ; une date ne compte qu'une fois complète
export function DateRangeFilter({ column, filter, label, onChange }: Props) {
	const from = filter?.from ?? null;
	const to = filter?.to ?? null;

	function update(nextFrom: string | null, nextTo: string | null) {
		onChange(
			nextFrom === null && nextTo === null
				? null
				: {
						column,
						kind: ColumnFilterKindEnum.DATE_RANGE,
						from: nextFrom,
						to: nextTo,
					},
		);
	}

	return (
		<RangeFilter
			label={label}
			summary={formatRangeSummary(
				from === null ? null : formatIsoDate(from),
				to === null ? null : formatIsoDate(to),
			)}
		>
			<FormField label="Depuis">
				<DateField
					value={from}
					commitOn="change"
					label={`${label}, depuis`}
					onCommit={(nextFrom) => update(nextFrom, to)}
				/>
			</FormField>
			<span
				className={styles.rangeDash}
				aria-hidden
			>
				–
			</span>
			<FormField label="Jusqu’à">
				<DateField
					value={to}
					commitOn="change"
					label={`${label}, jusqu’à`}
					onCommit={(nextTo) => update(from, nextTo)}
				/>
			</FormField>
		</RangeFilter>
	);
}
