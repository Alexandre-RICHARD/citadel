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
import type { SetEpisodesWatchedBodyDto } from "./setEpisodesWatchedBodyDto.type.ts";
import type { SetEpisodesWatchedPathParamDto } from "./setEpisodesWatchedPathParamDto.type.ts";

// Cases « Vu » d'une série : un épisode, ou toute une cascade (saison, série, épisodes précédents) confirmée par le front
export interface SetEpisodesWatched extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/user-media/:userMediaId/watched-episodes`;
		method: HttpMethodEnum.PUT;
		protected: true;
		pathParams: SetEpisodesWatchedPathParamDto;
		body: SetEpisodesWatchedBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: UserMediaDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<
			| BacklogErrorCodeEnum.USER_MEDIA_NOT_FOUND
			| BacklogErrorCodeEnum.EPISODE_NOT_IN_SHOW
		>;
	};
}
