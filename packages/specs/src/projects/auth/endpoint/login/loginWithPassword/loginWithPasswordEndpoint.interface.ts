import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { FlowStatusDto } from "../../../dto/flowStatusDto.type.ts";
import type { AuthErrorCodeEnum } from "../../../error/authErrorCode.enum.ts";
import type { LoginWithPasswordBodyDto } from "./loginWithPasswordBodyDto.type.ts";

// Connexion par email ou pseudo, et mot de passe. Sans double authentification, la session s'ouvre (flow null) ; avec,
// le parcours passe à l'étape « second facteur », sans session avant la fin
export interface LoginWithPassword extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/login/password`;
		method: HttpMethodEnum.POST;
		protected: false;
		body: LoginWithPasswordBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: FlowStatusDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		// Identifiant inconnu, mauvais mot de passe, ou connexion par mot de passe fermée par le compte : même réponse
		[HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION]: ErrorResponseDto<AuthErrorCodeEnum.INVALID_CREDENTIALS>;
		// Délai après un échec, ou bannissement temporaire : Retry-After dit quand réessayer
		[HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS]: ErrorResponseDto<AuthErrorCodeEnum.TOO_MANY_ATTEMPTS>;
		[HttpStatutCodeErrorEnum.SERVICE_UNAVAILABLE]: ErrorResponseDto<AuthErrorCodeEnum.AUTH_BUSY>;
	};
}
