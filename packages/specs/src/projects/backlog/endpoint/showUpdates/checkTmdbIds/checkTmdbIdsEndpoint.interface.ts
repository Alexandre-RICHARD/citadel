import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { TmdbIdCheckResultDto } from "../../../dto/showUpdate/tmdbIdCheckResultDto.type.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";

// Lancé chaque nuit par le job media-tmdb, par le réseau Docker : un septième des identifiants TMDB des backlogs, relus
export interface CheckTmdbIds extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.INTERNAL}${ApiPrefixEnum.BACKLOG}/tmdb-ids/check`;
		method: HttpMethodEnum.POST;
		protected: false;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: TmdbIdCheckResultDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_GATEWAY]: ErrorResponseDto<BacklogErrorCodeEnum.TMDB_UNAVAILABLE>;
	};
}
