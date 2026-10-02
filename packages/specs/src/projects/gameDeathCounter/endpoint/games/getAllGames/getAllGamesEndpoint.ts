import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { GameListDto } from "../../../dto/game/gameListDto.ts";

export interface GetAllGames extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games`;
		method: HttpMethodEnum.GET;
		protected: false;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: GameListDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: ErrorResponseDto;
	};
}
