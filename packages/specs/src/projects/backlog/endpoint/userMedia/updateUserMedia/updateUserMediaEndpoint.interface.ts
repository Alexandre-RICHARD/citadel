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
import type { UpdateUserMediaBodyDto } from "./updateUserMediaBodyDto.type.ts";
import type { UpdateUserMediaPathParamDto } from "./updateUserMediaPathParamDto.type.ts";

// Une cellule de la ligne : seuls les champs modifiés. « Vu » ne se coche ainsi que sur un film
export interface UpdateUserMedia extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/user-media/:userMediaId`;
		method: HttpMethodEnum.PATCH;
		protected: true;
		pathParams: UpdateUserMediaPathParamDto;
		body: UpdateUserMediaBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: UserMediaDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<BacklogErrorCodeEnum.USER_MEDIA_NOT_FOUND>;
		[HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER]: ErrorResponseDto<BacklogErrorCodeEnum.WATCHED_ONLY_FOR_MOVIES>;
	};
}
