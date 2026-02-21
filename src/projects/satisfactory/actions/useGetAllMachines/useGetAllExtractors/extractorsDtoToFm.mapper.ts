import type { ExtractorDto } from "@specs/project/satisfactory/dto/extractor.dto";

import { enumDtoToFmMapper } from "../../../../../common/helpers/enum/enumDtoToFm";
import { GameClassNamesEnum } from "../../../enums/gameClassNames.enum";
import type { ExtractorFm } from "./extractorFm.type";

export const extractorsDtoToFmMapper = (dto: ExtractorDto[]): ExtractorFm[] => {
	return dto.map((extractorDto) => {
		const className = enumDtoToFmMapper(
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
				z: extractorDto.location.z,
			},
		};
	});
};
