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
import type { CreateUserVersionBodyDto } from "./createUserVersionBodyDto.type.ts";
import type { CreateUserVersionPathParamDto } from "./createUserVersionPathParamDto.type.ts";

// « Ajouter une version jouée » à un jeu déjà dans le backlog
export interface CreateUserVersion extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/user-games/:gameId/user-versions`;
		method: HttpMethodEnum.POST;
		protected: false;
		pathParams: CreateUserVersionPathParamDto;
		body: CreateUserVersionBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.CREATED;
		data: UserGameDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<
			| BacklogErrorCodeEnum.USER_GAME_NOT_FOUND
			| BacklogErrorCodeEnum.VERSION_NOT_FOUND
			| BacklogErrorCodeEnum.DLC_NOT_FOUND
		>;
		[HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER]: ErrorResponseDto<
			| BacklogErrorCodeEnum.USER_VERSION_ALREADY_EXISTS
			| BacklogErrorCodeEnum.PLATFORM_NOT_ALLOWED
			| BacklogErrorCodeEnum.STATUS_NOT_ALLOWED
		>;
	};
}
