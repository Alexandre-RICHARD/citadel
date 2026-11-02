import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { TooManyRequestsResponseDto } from "../../../../../specUtils/error/tooManyRequestsResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { FlowStatusDto } from "../../../dto/flowStatusDto.type.ts";
import type { AuthErrorCodeEnum } from "../../../error/authErrorCode.enum.ts";
import type { StartRegistrationBodyDto } from "./startRegistrationBodyDto.type.ts";

// Commence une inscription : aucun compte avant la confirmation par le lien ou le code. La réponse est la même que
// l'adresse soit nouvelle ou déjà inscrite : seul le mail, dans la boîte concernée, dit ce qu'il en est
export interface StartRegistration extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/registrations`;
		method: HttpMethodEnum.POST;
		protected: false;
		body: StartRegistrationBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: FlowStatusDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		// Interrupteur d'urgence, ou quota quotidien de mails : GET /mail/status le dit avant l'envoi
		[HttpStatutCodeErrorEnum.FORBIDDEN]: ErrorResponseDto<AuthErrorCodeEnum.REGISTRATION_CLOSED>;
		[HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER]: ErrorResponseDto<AuthErrorCodeEnum.USERNAME_TAKEN>;
		// Trop d'inscriptions ou de mails depuis cette IP, ou vers cette adresse : Retry-After dit quand réessayer
		[HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS]: TooManyRequestsResponseDto;
		[HttpStatutCodeErrorEnum.SERVICE_UNAVAILABLE]: ErrorResponseDto<AuthErrorCodeEnum.AUTH_BUSY>;
	};
}
