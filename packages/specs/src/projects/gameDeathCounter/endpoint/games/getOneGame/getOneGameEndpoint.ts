import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { GameDto } from "../../../dto/game/gameDto.ts";
import type { GetOneGamePathParamDto } from "./getOneGamePathParamDto.ts";

export interface GetOneGame extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/:id`;
		method: HttpMethodEnum.GET;
		protected: false;
		pathParams: GetOneGamePathParamDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: GameDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: ErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto;
	};
}
