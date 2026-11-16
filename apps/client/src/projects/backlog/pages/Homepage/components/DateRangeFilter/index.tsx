import { formatShortIsoDate } from "@citadel/common/src/universal/date/formatShortIsoDate";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type";

import styles from "../../../../backlog.module.scss";
import { DateField } from "../../../../components/DateField";
import { formatRangeSummary } from "../../../../helper/format/formatRangeSummary";
import { FormField } from "../FormField";
import { RangeFilter } from "../RangeFilter";

type Props<Column extends string> = {
	column: Column;
	filter: Extract<
		ColumnFilter<Column>,
		{ kind: ColumnFilterKindEnum.DATE_RANGE }
	> | null;
	label: string;
	onChange: (filter: ColumnFilter<Column> | null) => void;
};

// Dates de début et de fin, incluses ; une date ne compte qu'une fois complète
export function DateRangeFilter<Column extends string>({
	column,
	filter,
	label,
	onChange,
}: Props<Column>) {
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
				from === null ? null : formatShortIsoDate(from),
				to === null ? null : formatShortIsoDate(to),
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
