import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { ShowSeasonListDto } from "../../../dto/userMedia/showSeasonListDto.type.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";
import type { GetShowSeasonsPathParamDto } from "./getShowSeasonsPathParamDto.type.ts";

// Dépliage d'une série : ses saisons et leurs épisodes, avec ceux que le compte a vus
export interface GetShowSeasons extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/user-media/:userMediaId/seasons`;
		method: HttpMethodEnum.GET;
		protected: true;
		pathParams: GetShowSeasonsPathParamDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: ShowSeasonListDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<BacklogErrorCodeEnum.USER_MEDIA_NOT_FOUND>;
	};
}
