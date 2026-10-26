import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { UserGameDto } from "../../../dto/userGame/userGameDto.type.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";
import type { CustomizeUserGameBodyDto } from "./customizeUserGameBodyDto.type.ts";
import type { CustomizeUserGamePathParamDto } from "./customizeUserGamePathParamDto.type.ts";

// « Personnaliser » : image, type de fin, série et numéro ; les statuts devenus incompatibles sont convertis
export interface CustomizeUserGame extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/user-games/:gameId`;
		method: HttpMethodEnum.PUT;
		protected: false;
		pathParams: CustomizeUserGamePathParamDto;
		body: CustomizeUserGameBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: UserGameDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<
			| BacklogErrorCodeEnum.USER_GAME_NOT_FOUND
			| BacklogErrorCodeEnum.SERIES_NOT_FOUND
		>;
	};
}
