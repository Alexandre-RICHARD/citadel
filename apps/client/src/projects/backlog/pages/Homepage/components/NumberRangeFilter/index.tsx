import type { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/rule/view/columnFilter.type";
import { useRef } from "react";

import styles from "../../../../backlog.module.scss";
import { formatRangeSummary } from "../../../../helper/format/formatRangeSummary";
import { UiDelayEnum } from "../../../../helper/timing/uiDelay.enum";
import { isDurationColumn } from "../../../../helper/view/isDurationColumn";
import { useDebouncedCallback } from "../../../../hooks/useDebouncedCallback";
import { RangeFilter } from "../RangeFilter";

const MINUTES_PER_HOUR = 60;

type Props = {
	column: BacklogColumnEnum;
	filter: Extract<
		ColumnFilter,
		{ kind: ColumnFilterKindEnum.NUMBER_RANGE }
	> | null;
	label: string;
	onChange: (filter: ColumnFilter | null) => void;
};

// Minimum et maximum d'un nombre ; les temps se saisissent en heures et se filtrent en minutes
export function NumberRangeFilter({ column, filter, label, onChange }: Props) {
	const unit = isDurationColumn(column) ? MINUTES_PER_HOUR : 1;
	const unitLabel = unit === MINUTES_PER_HOUR ? " h" : "";
	const minBound = filter?.min ?? null;
	const maxBound = filter?.max ?? null;
	const minRef = useRef<HTMLInputElement>(null);
	const maxRef = useRef<HTMLInputElement>(null);
	// Chaque frappe relit le tableau sur le serveur : une lecture par saisie
	const changeLater = useDebouncedCallback(
		onChange,
		UiDelayEnum.TYPING_DEBOUNCE,
	);

	function readBound(input: HTMLInputElement | null): number | null {
		if (input === null || input.value === "" || !input.validity.valid)
			return null;
		return Number(input.value) * unit;
	}

	function update() {
		const min = readBound(minRef.current);
		const max = readBound(maxRef.current);
		changeLater(
			min === null && max === null
				? null
				: { column, kind: ColumnFilterKindEnum.NUMBER_RANGE, min, max },
		);
	}

	function renderBound(bound: number | null, side: "min" | "max") {
		return (
			<span className={styles.rangeInputGroup}>
				<input
					ref={side === "min" ? minRef : maxRef}
					type="number"
					step="any"
					className={styles.rangeInput}
					placeholder={side}
					aria-label={`${label}, ${side === "min" ? "minimum" : "maximum"}`}
					defaultValue={bound === null ? "" : bound / unit}
					onChange={update}
				/>
				{unit === MINUTES_PER_HOUR && (
					<span className={styles.fieldUnit}>h</span>
				)}
			</span>
		);
	}

	return (
		<RangeFilter
			label={label}
			summary={formatRangeSummary(
				minBound === null ? null : `${minBound / unit}${unitLabel}`,
				maxBound === null ? null : `${maxBound / unit}${unitLabel}`,
			)}
		>
			<label className={styles.rangeField}>
				<span className={styles.formLabel}>Minimum</span>
				{renderBound(minBound, "min")}
			</label>
			<span
				className={styles.rangeDash}
				aria-hidden
			>
				–
			</span>
			<label className={styles.rangeField}>
				<span className={styles.formLabel}>Maximum</span>
				{renderBound(maxBound, "max")}
			</label>
		</RangeFilter>
	);
}
