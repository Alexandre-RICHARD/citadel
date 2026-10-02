import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { GameSummaryDto } from "../../../dto/game/gameSummaryDto.ts";
import type { SetGameFinishedBodyDto } from "./setGameFinishedBodyDto.ts";
import type { SetGameFinishedPathParamDto } from "./setGameFinishedPathParamDto.ts";

export interface SetGameFinished extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/:id/finished`;
		method: HttpMethodEnum.PATCH;
		protected: false;
		pathParams: SetGameFinishedPathParamDto;
		body: SetGameFinishedBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: GameSummaryDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: ErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
	};
}
