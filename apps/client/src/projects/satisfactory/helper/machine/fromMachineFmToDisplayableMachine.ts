import type { ExtractorFm } from "../../api/useGetAllMachines/useGetAllExtractors/extractorFm.type";
import type { GeneratorFm } from "../../api/useGetAllMachines/useGetAllGenerators/generatorFm.type";
import type { DisplayableMachines } from "../../pages/Machines/displayableMachines.type";

// Un générateur consomme du carburant, pas de courant : son efficacité est tout ou rien, selon qu'il tourne à plein régime
export function fromMachineFmToDisplayableMachine(
	machine: ExtractorFm | GeneratorFm,
): DisplayableMachines {
	const isGenerator = "powerProduction" in machine;
	return {
		id: machine.id,
		name: machine.name,
		className: machine.className,
		overclocking: machine.overclocking,
		efficiency: isGenerator
			? machine.isAtFullSpeed
				? 100
				: 0
			: machine.efficiency,
		powerConsumption: isGenerator ? undefined : machine.powerConsumption,
		powerProduction: isGenerator ? machine.powerProduction : undefined,
		location: machine.location,
	};
}
