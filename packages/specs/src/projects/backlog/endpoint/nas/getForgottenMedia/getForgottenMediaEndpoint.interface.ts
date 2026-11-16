import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { ForgottenMediaListDto } from "../../../dto/nas/forgottenMediaListDto.type.ts";
import type { BacklogErrorCodeEnum } from "../../../error/backlogErrorCode.enum.ts";

// Les médias oubliés : ce que le NAS contient sans être dans le backlog du compte
export interface GetForgottenMedia extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.BACKLOG}/nas/forgotten-media`;
		method: HttpMethodEnum.GET;
		protected: true;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: ForgottenMediaListDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.FORBIDDEN]: ErrorResponseDto<
			BacklogErrorCodeEnum.NAS_LOCKED | BacklogErrorCodeEnum.NAS_OWNER_ONLY
		>;
		[HttpStatutCodeErrorEnum.SERVICE_UNAVAILABLE]: ErrorResponseDto<BacklogErrorCodeEnum.NAS_SURVEY_UNAVAILABLE>;
	};
}
