import { toggleArrayItem } from "@citadel/common/src/universal/array/toggleArrayItem";
import type { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";
import { ColumnFilterKindEnum } from "@citadel/specs/src/projects/backlog/enum/columnFilterKind.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type";

import styles from "../../../../backlog.module.scss";
import { Checkbox } from "../../../../components/Checkbox";
import type { SelectOption } from "../../../../components/Select/selectOption.type";
import { RangeFilter } from "../RangeFilter";

type Props = {
	column: BacklogColumnEnum;
	filter: Extract<ColumnFilter, { kind: ColumnFilterKindEnum.VALUE }> | null;
	label: string;
	options: SelectOption<string>[];
	onChange: (filter: ColumnFilter | null) => void;
};

// Filtre d'une colonne à liste (type de fin, plateforme, statut) : des cases cumulables, une ligne passe si elle a l'une
// des valeurs cochées. Le bouton aussi étroit que la colonne résume les valeurs, les cases s'ouvrent dans un panneau
export function ValueFilter({
	column,
	filter,
	label,
	options,
	onChange,
}: Props) {
	const checkedValues = filter?.values ?? [];
	const summary =
		checkedValues.length === 0
			? null
			: options
					.filter(({ value }) => checkedValues.includes(value))
					.map((option) => option.label)
					.join(", ");

	return (
		<RangeFilter
			label={label}
			summary={summary}
		>
			<ul className={styles.valueFilterList}>
				{options.map((option) => (
					<li key={option.value}>
						<Checkbox
							checked={checkedValues.includes(option.value)}
							label={option.content ?? option.label}
							ariaLabel={option.label}
							onChange={() => {
								const values = toggleArrayItem(checkedValues, option.value);
								onChange(
									values.length === 0
										? null
										: { column, kind: ColumnFilterKindEnum.VALUE, values },
								);
							}}
						/>
					</li>
				))}
			</ul>
		</RangeFilter>
	);
}
