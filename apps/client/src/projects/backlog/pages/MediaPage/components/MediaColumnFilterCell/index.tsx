import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum";
import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type";

import type { SelectOption } from "../../../../components/Select/selectOption.type";
import { mediaTypeLabels } from "../../../../helper/label/mediaTypeLabels";
import { getLanguageLabel } from "../../../../helper/media/getLanguageLabel";
import { isDurationColumn } from "../../../../helper/view/isDurationColumn";
import { mediaTable } from "../../../../helper/view/mediaTable";
import { BooleanFilter } from "../../../Homepage/components/BooleanFilter";
import { DateRangeFilter } from "../../../Homepage/components/DateRangeFilter";
import { NumberRangeFilter } from "../../../Homepage/components/NumberRangeFilter";
import { TextFilter } from "../../../Homepage/components/TextFilter";
import { ValueFilter } from "../../../Homepage/components/ValueFilter";
import { MediaTypeIcon } from "../MediaTypeIcon";

type Props = {
	column: MediaColumnEnum;
	filter: ColumnFilter<MediaColumnEnum> | null;
	// Les langues originales du backlog, proposées au filtre de leur colonne
	originalLanguages: string[];
	onChange: (filter: ColumnFilter<MediaColumnEnum> | null) => void;
};

// Valeurs proposées par le filtre d'une colonne à liste : le type, ou les langues présentes dans le backlog, par nom
function getValueOptions(
	column: MediaColumnEnum,
	originalLanguages: string[],
): SelectOption<string>[] {
	if (column === MediaColumnEnum.MEDIA_TYPE)
		return Object.values(MediaTypeEnum).map((mediaType) => ({
			value: mediaType,
			label: mediaTypeLabels[mediaType],
			content: (
				<>
					<MediaTypeIcon mediaType={mediaType} />
					{mediaTypeLabels[mediaType]}
				</>
			),
		}));
	return originalLanguages
		.map((code) => ({ value: code, label: getLanguageLabel(code) }))
		.toSorted((first, second) => first.label.localeCompare(second.label, "fr"));
}

// Filtre d'une colonne du tableau des films et séries, dans la ligne sous les en-têtes
export function MediaColumnFilterCell({
	column,
	filter,
	originalLanguages,
	onChange,
}: Props) {
	const label = `Filtre ${mediaTable.labels[column]}`;

	switch (mediaTable.kinds[column]) {
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
					options={getValueOptions(column, originalLanguages)}
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
					isDuration={isDurationColumn(mediaTable, column)}
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
