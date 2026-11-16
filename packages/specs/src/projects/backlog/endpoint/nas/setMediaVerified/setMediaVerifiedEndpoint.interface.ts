import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";
import type { SetMediaVerifiedBodyDto } from "./setMediaVerifiedBodyDto.type.ts";
import type { SetMediaVerifiedPathParamDto } from "./setMediaVerifiedPathParamDto.type.ts";

/**
 * Les cases « Vérifié » d'un film, ou d'épisodes d'une série : la seule écriture du backlog sur le NAS, dans
 * verified/verified.json. Une case cochée garde l'empreinte du fichier du dernier relevé. Les fichiers absents ou en
 * doublon ne se cochent pas ; les décocher passe toujours
 */
export interface SetMediaVerified extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/nas/user-media/:userMediaId/verified`;
		method: HttpMethodEnum.PUT;
		protected: true;
		pathParams: SetMediaVerifiedPathParamDto;
		body: SetMediaVerifiedBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.NO_CONTENT;
		data: null;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<
			| BacklogErrorCodeEnum.USER_MEDIA_NOT_FOUND
			| BacklogErrorCodeEnum.EPISODE_NOT_IN_SHOW
		>;
		[HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER]: ErrorResponseDto<BacklogErrorCodeEnum.NOT_VERIFIABLE>;
		[HttpStatutCodeErrorEnum.FORBIDDEN]: ErrorResponseDto<
			BacklogErrorCodeEnum.NAS_LOCKED | BacklogErrorCodeEnum.NAS_OWNER_ONLY
		>;
		[HttpStatutCodeErrorEnum.SERVICE_UNAVAILABLE]: ErrorResponseDto<BacklogErrorCodeEnum.NAS_SURVEY_UNAVAILABLE>;
	};
}
