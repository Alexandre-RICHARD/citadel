import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { DeleteGamePathParamDto } from "./deleteGamePathParamDto.ts";

export interface DeleteGame extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/:id`;
		method: HttpMethodEnum.DELETE;
		protected: false;
		pathParams: DeleteGamePathParamDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.NO_CONTENT;
		data: null;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: ErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto;
	};
}
