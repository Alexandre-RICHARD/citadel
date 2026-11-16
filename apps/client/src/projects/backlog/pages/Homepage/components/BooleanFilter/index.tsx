import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type";
import { ViewParamSyntaxEnum } from "@citadel/specs/src/projects/backlog/helper/view/viewParamSyntax.enum";
import { Check, Minus, X } from "lucide-react";

import styles from "../../../../backlog.module.scss";
import { Select } from "../../../../components/Select";

const ALL_VALUES = "";
const YES = String(ViewParamSyntaxEnum.YES);
const NO = String(ViewParamSyntaxEnum.NO);

type Props<Column extends string> = {
	column: Column;
	filter: Extract<
		ColumnFilter<Column>,
		{ kind: ColumnFilterKindEnum.BOOLEAN }
	> | null;
	label: string;
	onChange: (filter: ColumnFilter<Column> | null) => void;
};

// Filtre d'une case à cocher : tous, oui ou non. Colonne étroite : le champ ne montre qu'une icône, la liste les libellés
export function BooleanFilter<Column extends string>({
	column,
	filter,
	label,
	onChange,
}: Props<Column>) {
	let selectedValue = ALL_VALUES;
	if (filter !== null) selectedValue = filter.value ? YES : NO;
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
			isHighlighted={filter !== null}
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
