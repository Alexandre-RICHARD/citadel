import { useState } from "react";

import type { ExtractorFm } from "../../actions/useGetAllMachines/useGetAllExtractors/extractorFm.type";
import type { GeneratorFm } from "../../actions/useGetAllMachines/useGetAllGenerators/generatorFm.type";
import { GameClassNamesEnum } from "../../enums/gameClassNames.enum.ts";
import type { DisplayableMachines } from "./DisplayableMachines.type";

type Args = {
	allMachines: (ExtractorFm | GeneratorFm)[];
};

type Return = {
	machines: DisplayableMachines[];
	averageEfficiency: number | undefined;
	onlyNonFullEfficent: boolean;
	setOnlyNonFullEfficent: (newValue: boolean) => void;
	removedHubBiomassGenerators: boolean;
	setRemovedHubBiomassGenerators: (newValue: boolean) => void;
};

function getMachineEfficiency(machine: ExtractorFm | GeneratorFm): number {
	if ("powerProduction" in machine) {
		return machine.isAtFullSpeed ? 100 : 0;
	}
	return machine.efficiency;
}

function getMachinePowerConsumption(
	machine: ExtractorFm | GeneratorFm,
): number | undefined {
	if ("powerProduction" in machine) return machine.powerProduction;
	return undefined;
}

function getMachinePowerProduction(
	machine: ExtractorFm | GeneratorFm,
): number | undefined {
	if ("powerConsumption" in machine) return machine.powerConsumption;
	return undefined;
}

function getAverageEfficiency(
	machines: DisplayableMachines[],
): number | undefined {
	const totalMachinesEfficencies = machines.reduce<number>(
		(acc, machine) => acc + machine.efficiency,
		0,
	);

	return machines.length
		? totalMachinesEfficencies / machines.length
		: undefined;
}

export function useMachines({ allMachines }: Args): Return {
	const [onlyNonFullEfficent, setOnlyNonFullEfficent] = useState(false);
	const [removedHubBiomassGenerators, setRemovedHubBiomassGenerators] =
		useState(false);

	const machinesArranged: DisplayableMachines[] = allMachines.map(
		(machine) => ({
			id: machine.id,
			name: machine.name,
			className: machine.className,
			overclocking: machine.overclocking,
			efficiency: getMachineEfficiency(machine),
			powerConsumption: getMachinePowerConsumption(machine),
			powerProduction: getMachinePowerProduction(machine),
			location: machine.location,
		}),
	);

	const firstfilterMachines = machinesArranged.filter((machine) => {
		if (
			removedHubBiomassGenerators &&
			machine.className ===
				GameClassNamesEnum.Build_GeneratorIntegratedBiomass_C
		)
			return false;
		return true;
	});

	const finalfilteredMachines: DisplayableMachines[] = machinesArranged.filter(
		(machine) => {
			if (
				removedHubBiomassGenerators &&
				machine.className ===
					GameClassNamesEnum.Build_GeneratorIntegratedBiomass_C
			)
				return false;

			if (onlyNonFullEfficent) return machine.efficiency !== 100;

			return true;
		},
	);

	const sortedMachines = finalfilteredMachines.sort(
		(a, b) => a.efficiency - b.efficiency,
	);

	const averageEfficiency = getAverageEfficiency(firstfilterMachines);

	return {
		machines: sortedMachines,
		averageEfficiency,
		onlyNonFullEfficent,
		setOnlyNonFullEfficent,
		removedHubBiomassGenerators,
		setRemovedHubBiomassGenerators,
	};
}
