import type { GeneratorDto } from "@specs/project/satisfactory/dto/generator.dto";

import { enumDtoToFmMapper } from "../../../../../common/helpers/enum/enumDtoToFm";
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
