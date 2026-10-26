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
import type { CreateUserGameBodyDto } from "./createUserGameBodyDto.type.ts";

// Ajout au backlog : la personnalisation du jeu et sa première version jouée, en une seule action
export interface CreateUserGame extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/user-games`;
		method: HttpMethodEnum.POST;
		protected: false;
		body: CreateUserGameBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.CREATED;
		data: UserGameDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<
			| BacklogErrorCodeEnum.GAME_NOT_FOUND
			| BacklogErrorCodeEnum.VERSION_NOT_FOUND
			| BacklogErrorCodeEnum.SERIES_NOT_FOUND
			| BacklogErrorCodeEnum.DLC_NOT_FOUND
		>;
		[HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER]: ErrorResponseDto<
			| BacklogErrorCodeEnum.USER_GAME_ALREADY_EXISTS
			| BacklogErrorCodeEnum.PLATFORM_NOT_ALLOWED
		>;
	};
}
