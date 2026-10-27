import { describe, expect, it } from "vitest";

import type { ExtractorFm } from "../../api/useGetAllMachines/useGetAllExtractors/extractorFm.type";
import type { GeneratorFm } from "../../api/useGetAllMachines/useGetAllGenerators/generatorFm.type";
import { GameClassNamesEnum } from "../../enums/gameClassNames.enum";
import { fromMachineFmToDisplayableMachine } from "./fromMachineFmToDisplayableMachine";

const LOCATION = { x: 1, y: 2, z: 3 };

const extractor: ExtractorFm = {
	id: "miner-1",
	name: "Miner",
	className: GameClassNamesEnum.Build_MinerMk1_C,
	overclocking: 150,
	efficiency: 87.5,
	powerConsumption: 12,
	location: LOCATION,
};

const generator: GeneratorFm = {
	id: "coal-1",
	name: "Coal Generator",
	className: GameClassNamesEnum.Build_GeneratorCoal_C,
	overclocking: 100,
	isAtFullSpeed: true,
	powerProduction: 75,
	location: LOCATION,
};

describe("fromMachineFmToDisplayableMachine.ts", () => {
	describe("machine that uses power", () => {
		it("SHOULD keep its efficiency and show what it consumes", () => {
			expect(fromMachineFmToDisplayableMachine(extractor)).toStrictEqual({
				id: "miner-1",
				name: "Miner",
				className: GameClassNamesEnum.Build_MinerMk1_C,
				overclocking: 150,
				efficiency: 87.5,
				powerConsumption: 12,
				powerProduction: undefined,
				location: LOCATION,
			});
		});
	});

	describe("generator", () => {
		it("SHOULD show what it produces, not as a consumption", () => {
			const machine = fromMachineFmToDisplayableMachine(generator);

			expect(machine.powerProduction).toBe(75);
			expect(machine.powerConsumption).toBeUndefined();
		});

		it.each([
			{ isAtFullSpeed: true, expected: 100 },
			{ isAtFullSpeed: false, expected: 0 },
		])(
			"SHOULD have an efficiency of $expected WHEN its full speed is $isAtFullSpeed",
			({ isAtFullSpeed, expected }) => {
				expect(
					fromMachineFmToDisplayableMachine({ ...generator, isAtFullSpeed })
						.efficiency,
				).toBe(expected);
			},
		);
	});
});
