import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { UserMediaDto } from "../../../dto/userMedia/userMediaDto.type.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";
import type { CreateUserMediaBodyDto } from "./createUserMediaBodyDto.type.ts";

// Ajouter au backlog : le média est lu sur TMDB et enregistré s'il n'est pas en base, une série avec toutes ses saisons et tous ses épisodes
export interface CreateUserMedia extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/user-media`;
		method: HttpMethodEnum.POST;
		protected: true;
		body: CreateUserMediaBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.CREATED;
		data: UserMediaDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<
			| BacklogErrorCodeEnum.TMDB_MEDIA_NOT_FOUND
			| BacklogErrorCodeEnum.SAGA_NOT_FOUND
		>;
		[HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER]: ErrorResponseDto<BacklogErrorCodeEnum.USER_MEDIA_ALREADY_EXISTS>;
		[HttpStatutCodeErrorEnum.BAD_GATEWAY]: ErrorResponseDto<BacklogErrorCodeEnum.TMDB_UNAVAILABLE>;
	};
}
