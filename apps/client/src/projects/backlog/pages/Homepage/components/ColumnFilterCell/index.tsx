import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum";
import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/rule/view/columnFilter.type";
import { columnFilterKinds } from "@citadel/specs/src/projects/backlog/rule/view/columnFilterKinds";
import { ViewParamSyntaxEnum } from "@citadel/specs/src/projects/backlog/rule/view/viewParamSyntax.enum";
import { Check, Minus, X } from "lucide-react";

import styles from "../../../../backlog.module.scss";
import { Select } from "../../../../components/Select";
import type { SelectOption } from "../../../../components/Select/selectOption.type";
import { columnLabels } from "../../../../helper/label/columnLabels";
import { endingTypeLabels } from "../../../../helper/label/endingTypeLabels";
import { statusLabels } from "../../../../helper/label/statusLabels";
import { DateRangeFilter } from "../DateRangeFilter";
import { EndingTypeLabel } from "../EndingTypeLabel";
import { NumberRangeFilter } from "../NumberRangeFilter";
import { StatusBadge } from "../StatusBadge";
import { TextFilter } from "../TextFilter";

const ALL_VALUES = "";
const YES = String(ViewParamSyntaxEnum.YES);
const NO = String(ViewParamSyntaxEnum.NO);

type Props = {
	column: BacklogColumnEnum;
	filter: ColumnFilter | null;
	// Plateformes des versions jouées, proposées au filtre de la colonne Plateforme
	platformNames: string[];
	onChange: (filter: ColumnFilter | null) => void;
};

// Valeurs proposées par le filtre d'une colonne à liste
function getValueOptions(
	column: BacklogColumnEnum,
	platformNames: string[],
): SelectOption<string>[] {
	if (column === BacklogColumnEnum.ENDING_TYPE)
		return Object.values(EndingTypeEnum).map((endingType) => ({
			value: endingType,
			label: endingTypeLabels[endingType].label,
			content: <EndingTypeLabel endingType={endingType} />,
		}));
	if (column === BacklogColumnEnum.STATUS)
		return Object.values(StatusEnum).map((status) => ({
			value: status,
			label: statusLabels[status].label,
			content: <StatusBadge status={status} />,
		}));
	return platformNames.map((name) => ({ value: name, label: name }));
}

// Filtre d'une colonne, dans la ligne sous les en-têtes (cahier des charges, §9)
export function ColumnFilterCell({
	column,
	filter,
	platformNames,
	onChange,
}: Props) {
	const label = `Filtre ${columnLabels[column]}`;

	switch (columnFilterKinds[column]) {
		case ColumnFilterKindEnum.TEXT:
			return (
				<TextFilter
					column={column}
					filter={filter?.kind === ColumnFilterKindEnum.TEXT ? filter : null}
					label={label}
					onChange={onChange}
				/>
			);
		case ColumnFilterKindEnum.VALUE:
			return (
				<Select
					value={
						filter?.kind === ColumnFilterKindEnum.VALUE
							? filter.value
							: ALL_VALUES
					}
					options={[
						{ value: ALL_VALUES, label: "Tous" },
						...getValueOptions(column, platformNames),
					]}
					ariaLabel={label}
					size="sm"
					isHighlighted={filter?.kind === ColumnFilterKindEnum.VALUE}
					className={styles.filterSelect}
					onChange={(value) =>
						onChange(
							value === ALL_VALUES
								? null
								: { column, kind: ColumnFilterKindEnum.VALUE, value },
						)
					}
				/>
			);
		case ColumnFilterKindEnum.BOOLEAN: {
			let selectedValue = ALL_VALUES;
			if (filter?.kind === ColumnFilterKindEnum.BOOLEAN)
				selectedValue = filter.value ? YES : NO;
			// Colonne étroite : le champ ne montre qu'une icône, la liste les libellés
			return (
				<Select
					value={selectedValue}
					options={[
						{
							value: ALL_VALUES,
							label: "Tous",
							triggerContent: (
								<Minus
									className={styles.filterAllMark}
									aria-hidden
								/>
							),
						},
						{ value: YES, label: "Oui", triggerContent: <Check aria-hidden /> },
						{ value: NO, label: "Non", triggerContent: <X aria-hidden /> },
					]}
					ariaLabel={label}
					size="sm"
					isCompact
					isHighlighted={filter?.kind === ColumnFilterKindEnum.BOOLEAN}
					className={styles.filterSelect}
					onChange={(value) =>
						onChange(
							value === ALL_VALUES
								? null
								: {
										column,
										kind: ColumnFilterKindEnum.BOOLEAN,
										value: value === YES,
									},
						)
					}
				/>
			);
		}
		case ColumnFilterKindEnum.NUMBER_RANGE:
			return (
				<NumberRangeFilter
					column={column}
					filter={
						filter?.kind === ColumnFilterKindEnum.NUMBER_RANGE ? filter : null
					}
					label={label}
					onChange={onChange}
				/>
			);
		case ColumnFilterKindEnum.DATE_RANGE:
			return (
				<DateRangeFilter
					column={column}
					filter={
						filter?.kind === ColumnFilterKindEnum.DATE_RANGE ? filter : null
					}
					label={label}
					onChange={onChange}
				/>
			);
		default:
			return null;
	}
}
