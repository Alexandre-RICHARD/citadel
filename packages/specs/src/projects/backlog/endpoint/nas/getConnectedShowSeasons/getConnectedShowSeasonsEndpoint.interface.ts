import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { ConnectedShowSeasonListDto } from "../../../dto/nas/connectedShowSeasonListDto.type.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";
import type { GetConnectedShowSeasonsPathParamDto } from "./getConnectedShowSeasonsPathParamDto.type.ts";

// Dépliage d'une série en mode connecté : ses saisons et ses épisodes, avec leurs colonnes du NAS
export interface GetConnectedShowSeasons extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/nas/user-media/:userMediaId/seasons`;
		method: HttpMethodEnum.GET;
		protected: true;
		pathParams: GetConnectedShowSeasonsPathParamDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: ConnectedShowSeasonListDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<BacklogErrorCodeEnum.USER_MEDIA_NOT_FOUND>;
		[HttpStatutCodeErrorEnum.FORBIDDEN]: ErrorResponseDto<
			BacklogErrorCodeEnum.NAS_LOCKED | BacklogErrorCodeEnum.NAS_OWNER_ONLY
		>;
		[HttpStatutCodeErrorEnum.SERVICE_UNAVAILABLE]: ErrorResponseDto<BacklogErrorCodeEnum.NAS_SURVEY_UNAVAILABLE>;
	};
}
