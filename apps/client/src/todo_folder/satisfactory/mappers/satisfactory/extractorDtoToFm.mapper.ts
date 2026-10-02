import { enumDtoToFm } from "@citadel/common/src/universal/enum/enumDtoToFm";

import { GameClassNamesEnum } from "../../enums/gameClassNames.enum";
import type { ExtractorDto } from "../../types/satisfactory/apis/dataTransferObject/extractorDto.type";
import type { ExtractorFm } from "../../types/satisfactory/apis/frontModel/extractorFm.type";

export const extractorDtoToFmMapper = (dto: ExtractorDto[]): ExtractorFm[] => {
	return dto.map((extractorDto) => {
		const className = enumDtoToFm(
			extractorDto.ClassName,
			GameClassNamesEnum,
			"GameClassNamesEnum",
		);

		return {
			id: extractorDto.ID,
			name: extractorDto.Name,
			className,
			overclocking: extractorDto.ManuSpeed,
			efficiency: extractorDto.production?.[0].ProdPercent ?? 0,
			powerConsumption: extractorDto.PowerInfo.PowerConsumed,
			location: {
				x: extractorDto.location.x,
				y: extractorDto.location.y,
			},
		};
	});
};
