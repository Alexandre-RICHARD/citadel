import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { ConnectedUserMediaListDto } from "../../../dto/nas/connectedUserMediaListDto.type.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";
import type { GetConnectedUserMediaQueryParamDto } from "./getConnectedUserMediaQueryParamDto.type.ts";

// Le tableau en mode connecté : le backlog fusionné avec le dernier relevé du NAS, trié, filtré et découpé en pages
export interface GetConnectedUserMedia extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/nas/user-media`;
		method: HttpMethodEnum.GET;
		protected: true;
		queryParams: GetConnectedUserMediaQueryParamDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: ConnectedUserMediaListDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.FORBIDDEN]: ErrorResponseDto<
			BacklogErrorCodeEnum.NAS_LOCKED | BacklogErrorCodeEnum.NAS_OWNER_ONLY
		>;
		[HttpStatutCodeErrorEnum.SERVICE_UNAVAILABLE]: ErrorResponseDto<BacklogErrorCodeEnum.NAS_SURVEY_UNAVAILABLE>;
	};
}
