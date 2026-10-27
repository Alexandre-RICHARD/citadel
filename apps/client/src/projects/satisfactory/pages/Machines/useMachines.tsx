import { average } from "@citadel/common/src/universal/number/average";
import { useState } from "react";

import type { ExtractorFm } from "../../api/useGetAllMachines/useGetAllExtractors/extractorFm.type";
import type { GeneratorFm } from "../../api/useGetAllMachines/useGetAllGenerators/generatorFm.type";
import { GameClassNamesEnum } from "../../enums/gameClassNames.enum";
import { fromMachineFmToDisplayableMachine } from "../../helper/machine/fromMachineFmToDisplayableMachine";
import type { DisplayableMachines } from "./displayableMachines.type";

const FULL_EFFICIENCY = 100;

type Args = {
	allMachines: (ExtractorFm | GeneratorFm)[];
};

type Return = {
	machines: DisplayableMachines[];
	// null sans machine
	averageEfficiency: number | null;
	onlyNonFullEfficent: boolean;
	setOnlyNonFullEfficent: (newValue: boolean) => void;
	removedHubBiomassGenerators: boolean;
	setRemovedHubBiomassGenerators: (newValue: boolean) => void;
};

export function useMachines({ allMachines }: Args): Return {
	const [onlyNonFullEfficent, setOnlyNonFullEfficent] = useState(false);
	const [removedHubBiomassGenerators, setRemovedHubBiomassGenerators] =
		useState(false);

	// Les brûleurs de biomasse du HUB, ignorés, ne comptent pas non plus dans la moyenne
	const countedMachines = allMachines
		.map(fromMachineFmToDisplayableMachine)
		.filter(
			(machine) =>
				!removedHubBiomassGenerators ||
				machine.className !==
					GameClassNamesEnum.Build_GeneratorIntegratedBiomass_C,
		);
	const shownMachines = onlyNonFullEfficent
		? countedMachines.filter(
				(machine) => machine.efficiency !== FULL_EFFICIENCY,
			)
		: countedMachines;

	return {
		machines: shownMachines.toSorted(
			(first, second) => first.efficiency - second.efficiency,
		),
		averageEfficiency: average(
			countedMachines.map((machine) => machine.efficiency),
		),
		onlyNonFullEfficent,
		setOnlyNonFullEfficent,
		removedHubBiomassGenerators,
		setRemovedHubBiomassGenerators,
	};
}
