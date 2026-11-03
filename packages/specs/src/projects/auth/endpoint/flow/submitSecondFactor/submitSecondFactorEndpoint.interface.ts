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
import type { SubmitSecondFactorBodyDto } from "./submitSecondFactorBodyDto.type.ts";

/**
 * L'étape « second facteur » d'une connexion ou d'un mot de passe oublié : un code de l'application d'authentification,
 * reçu par email (connexion par mot de passe seulement, après `POST /auth/flow/resend`) ou de secours. Accepté, la
 * connexion ouvre la session (flow null), le mot de passe oublié passe au nouveau mot de passe. Chaque échec compte
 * comme un mauvais mot de passe, pour le compte et pour l'IP
 */
export interface SubmitSecondFactor extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/flow/second-factor`;
		method: HttpMethodEnum.POST;
		protected: false;
		body: SubmitSecondFactorBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: FlowStatusDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		// Code faux, déjà utilisé ou d'une méthode que l'étape ne propose pas ; tous les essais du code reçu par email
		// faits ; plus de parcours à cette étape
		[HttpStatutCodeErrorEnum.BAD_REQUEST]:
			| ValidationErrorResponseDto
			| ErrorResponseDto<
					| AuthErrorCodeEnum.INVALID_CODE
					| AuthErrorCodeEnum.CODE_ATTEMPTS_EXHAUSTED
					| AuthErrorCodeEnum.FLOW_EXPIRED
			  >;
		// Délai après un échec, ou bannissement temporaire : Retry-After dit quand réessayer
		[HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS]: ErrorResponseDto<AuthErrorCodeEnum.TOO_MANY_ATTEMPTS>;
	};
}
