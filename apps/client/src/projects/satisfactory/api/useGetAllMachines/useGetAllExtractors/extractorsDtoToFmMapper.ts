import { enumDtoToFm } from "@citadel/common/src/universal/enum/enumDtoToFm";
import type { ExtractorDto } from "@citadel/specs/src/projects/satisfactory/dto/extractorDto.type";

import { GameClassNamesEnum } from "../../../enums/gameClassNames.enum";
import type { ExtractorFm } from "./extractorFm.type";

export function extractorsDtoToFmMapper(dto: ExtractorDto[]): ExtractorFm[] {
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
				z: extractorDto.location.z,
			},
		};
	});
}
