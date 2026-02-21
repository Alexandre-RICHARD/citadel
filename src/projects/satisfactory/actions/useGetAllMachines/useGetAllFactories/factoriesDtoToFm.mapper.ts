import { enumDtoToFmMapper } from "../../../../../common/helpers/enum/enumDtoToFm";
import { GameClassNamesEnum } from "../../../enums/gameClassNames.enum";
import type { FactoryFm } from "./factoryFm.type";
import type { FactoryDto } from '@specs/project/satisfactory/dto/factory.dto'

export const factoryDtoToFmMapper = (dto: FactoryDto[]): FactoryFm[] => {
	return dto.map((factoryDto) => {
		const className = enumDtoToFmMapper(
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
};
