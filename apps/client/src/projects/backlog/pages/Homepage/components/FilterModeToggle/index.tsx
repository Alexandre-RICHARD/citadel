import { FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum";

import { SegmentedControl } from "../../../../components/SegmentedControl";

type Props = {
	value: FilterModeEnum;
	onChange: (value: FilterModeEnum) => void;
};

// Combinaison des filtres des colonnes : une ligne doit les passer tous (ET), ou au moins un (OU)
export function FilterModeToggle({ value, onChange }: Props) {
	return (
		<SegmentedControl
			value={value}
			options={[
				{ value: FilterModeEnum.AND, label: "ET" },
				{ value: FilterModeEnum.OR, label: "OU" },
			]}
			ariaLabel="Combinaison des filtres : tous (ET) ou au moins un (OU)"
			onChange={onChange}
		/>
	);
}
