import { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum";
import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type";

import type { SelectOption } from "../../../../components/Select/selectOption.type";
import { endingTypeLabels } from "../../../../helper/label/endingTypeLabels";
import { getStatusLabel } from "../../../../helper/status/getStatusLabel";
import { gameTable } from "../../../../helper/view/gameTable";
import { isDurationColumn } from "../../../../helper/view/isDurationColumn";
import { BooleanFilter } from "../BooleanFilter";
import { DateRangeFilter } from "../DateRangeFilter";
import { EndingTypeLabel } from "../EndingTypeLabel";
import { NumberRangeFilter } from "../NumberRangeFilter";
import { StatusBadge } from "../StatusBadge";
import { TextFilter } from "../TextFilter";
import { ValueFilter } from "../ValueFilter";

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
			label: getStatusLabel(status, undefined),
			content: <StatusBadge status={status} />,
		}));
	return platformNames.map((name) => ({ value: name, label: name }));
}

// Filtre d'une colonne, dans la ligne sous les en-têtes
export function ColumnFilterCell({
	column,
	filter,
	platformNames,
	onChange,
}: Props) {
	const label = `Filtre ${gameTable.labels[column]}`;

	switch (gameTable.kinds[column]) {
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
				<ValueFilter
					column={column}
					filter={filter?.kind === ColumnFilterKindEnum.VALUE ? filter : null}
					label={label}
					options={getValueOptions(column, platformNames)}
					onChange={onChange}
				/>
			);
		case ColumnFilterKindEnum.BOOLEAN:
			return (
				<BooleanFilter
					column={column}
					filter={filter?.kind === ColumnFilterKindEnum.BOOLEAN ? filter : null}
					label={label}
					onChange={onChange}
				/>
			);
		case ColumnFilterKindEnum.NUMBER_RANGE:
			return (
				<NumberRangeFilter
					column={column}
					filter={
						filter?.kind === ColumnFilterKindEnum.NUMBER_RANGE ? filter : null
					}
					label={label}
					isDuration={isDurationColumn(gameTable, column)}
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
