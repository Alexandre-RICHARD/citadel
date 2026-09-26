import { GameClassNamesEnum } from "../../enums/gameClassNames.enum";
import { enumDtoToFmMapper } from "../../nexus/mappers/enumDtoToFm.mapper";
import type { WorldInvDto } from "../../types/satisfactory/apis/dataTransferObject/worldInvDto.type";
import type { WorldInventoryFM } from "../../types/satisfactory/apis/frontModel/worldInventoryFm.type";

export const worldInventoryDtoToFmMapper = (
	dto: WorldInvDto[],
): WorldInventoryFM[] => {
	return dto.map((worldInvDto) => {
		const className = enumDtoToFmMapper(
			worldInvDto.ClassName,
			GameClassNamesEnum,
			"GameClassNamesEnum",
		);

		return {
			className,
			amount: worldInvDto.Amount,
		};
	});
};
