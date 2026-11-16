import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum";
import { type LanguageTagEnum } from "@citadel/specs/src/projects/backlog/enum/languageTag.enum";
import { MediaColumnEnum } from "@citadel/specs/src/projects/backlog/enum/mediaColumn.enum";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import { NasColumnEnum } from "@citadel/specs/src/projects/backlog/enum/nasColumn.enum";
import { type NasGapKindEnum } from "@citadel/specs/src/projects/backlog/enum/nasGapKind.enum";
import { type NasQualityEnum } from "@citadel/specs/src/projects/backlog/enum/nasQuality.enum";
import { type NasSharingEnum } from "@citadel/specs/src/projects/backlog/enum/nasSharing.enum";
import { type NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type";
import type { ConnectedMediaColumn } from "@citadel/specs/src/projects/backlog/helper/view/connectedMediaColumn.type";

import type { SelectOption } from "../../../../components/Select/selectOption.type";
import { languageTagLabels } from "../../../../helper/label/languageTagLabels";
import { mediaTypeLabels } from "../../../../helper/label/mediaTypeLabels";
import { nasGapKindLabels } from "../../../../helper/label/nasGapKindLabels";
import { nasQualityLabels } from "../../../../helper/label/nasQualityLabels";
import { nasSharingLabels } from "../../../../helper/label/nasSharingLabels";
import { nasStorageLabels } from "../../../../helper/label/nasStorageLabels";
import { getLanguageLabel } from "../../../../helper/media/getLanguageLabel";
import { isDurationColumn } from "../../../../helper/view/isDurationColumn";
import { BooleanFilter } from "../../../Homepage/components/BooleanFilter";
import { DateRangeFilter } from "../../../Homepage/components/DateRangeFilter";
import { NumberRangeFilter } from "../../../Homepage/components/NumberRangeFilter";
import { TextFilter } from "../../../Homepage/components/TextFilter";
import { ValueFilter } from "../../../Homepage/components/ValueFilter";
import { useMediaMode } from "../../useMediaMode";
import { MediaTypeIcon } from "../MediaTypeIcon";

type Props = {
	column: ConnectedMediaColumn;
	filter: ColumnFilter<ConnectedMediaColumn> | null;
	// Les langues originales du backlog, proposées au filtre de leur colonne
	originalLanguages: string[];
	onChange: (filter: ColumnFilter<ConnectedMediaColumn> | null) => void;
};

// Les valeurs d'un enum, dans son ordre, avec leurs libellés
function enumOptions<Value extends string>(
	labels: Readonly<Record<Value, string>>,
): SelectOption<string>[] {
	return (Object.keys(labels) as Value[]).map((value) => ({
		value,
		label: labels[value],
	}));
}

// Les colonnes à liste du NAS : leurs valeurs dans l'ordre de leur enum
const NAS_VALUE_OPTIONS: Partial<
	Record<ConnectedMediaColumn, SelectOption<string>[]>
> = {
	[NasColumnEnum.STORAGE]: enumOptions<NasStorageEnum>(nasStorageLabels),
	[NasColumnEnum.SHARING]: enumOptions<NasSharingEnum>(nasSharingLabels),
	[NasColumnEnum.QUALITY]: enumOptions<NasQualityEnum>(nasQualityLabels),
	[NasColumnEnum.LANGUAGES]: enumOptions<LanguageTagEnum>(languageTagLabels),
	[NasColumnEnum.GAPS]: enumOptions<NasGapKindEnum>(nasGapKindLabels),
};

// Valeurs proposées par le filtre d'une colonne à liste : le type, les états du NAS, ou les langues du backlog, par nom
function getValueOptions(
	column: ConnectedMediaColumn,
	originalLanguages: string[],
): SelectOption<string>[] {
	const nasOptions = NAS_VALUE_OPTIONS[column];
	if (nasOptions !== undefined) return nasOptions;
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
	const { table } = useMediaMode();
	const label = `Filtre ${table.labels[column]}`;

	switch (table.kinds[column]) {
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
					isDuration={isDurationColumn(table, column)}
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
