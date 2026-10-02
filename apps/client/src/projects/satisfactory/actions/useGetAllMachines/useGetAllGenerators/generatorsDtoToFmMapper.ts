import { enumDtoToFmMapper } from "@citadel/common/src/universal/enum/enumDtoToFm";
import type { GeneratorDto } from "@citadel/specs/src/projects/satisfactory/dto/generatorDto.type";

import { GameClassNamesEnum } from "../../../enums/gameClassNames.enum";
import type { GeneratorFm } from "./generatorFm.type";

export const generatorsDtoToFmMapper = (dto: GeneratorDto[]): GeneratorFm[] => {
	return dto.map((generatorDto) => {
		const className = enumDtoToFmMapper(
			generatorDto.ClassName,
			GameClassNamesEnum,
			"GameClassNamesEnum",
		);

		return {
			id: crypto.randomUUID(),
			name: generatorDto.Name,
			className,
			overclocking: generatorDto.CurrentPotential,
			isAtFullSpeed: generatorDto.CanStart ?? generatorDto.IsFullSpeed,
			powerProduction: generatorDto.DynamicProdCapacity,
			location: {
				x: generatorDto.location.x,
				y: generatorDto.location.y,
				z: generatorDto.location.z,
			},
		};
	});
};
