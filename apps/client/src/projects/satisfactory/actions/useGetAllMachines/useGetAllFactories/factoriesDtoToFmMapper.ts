import { enumDtoToFm } from "@citadel/common/src/universal/enum/enumDtoToFm";
import type { FactoryDto } from "@citadel/specs/src/projects/satisfactory/dto/factoryDto.type";

import { GameClassNamesEnum } from "../../../enums/gameClassNames.enum";
import type { FactoryFm } from "./factoryFm.type";

export function factoryDtoToFmMapper(dto: FactoryDto[]): FactoryFm[] {
	return dto.map((factoryDto) => {
		const className = enumDtoToFm(
			factoryDto.ClassName,
			GameClassNamesEnum,
			"GameClassNamesEnum",
		);

		return {
			id: factoryDto.ID,
			name: factoryDto.Name,
			className,
			overclocking: factoryDto.ManuSpeed,
			efficiency: factoryDto.Productivity,
			powerConsumption: factoryDto.PowerInfo.PowerConsumed,
			location: {
				x: factoryDto.location.x,
				y: factoryDto.location.y,
				z: factoryDto.location.z,
			},
		};
	});
}
