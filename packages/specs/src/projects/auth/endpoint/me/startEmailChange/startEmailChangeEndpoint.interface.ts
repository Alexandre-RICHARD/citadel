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
import type { StartEmailChangeBodyDto } from "./startEmailChangeBodyDto.type.ts";

/**
 * Commence le changement d'adresse email, mot de passe redemandé : un parcours `email_change`, dont le mail (lien +
 * code) part à la nouvelle adresse. La réponse est la même que l'adresse soit libre ou déjà inscrite (dans ce cas, le
 * mail dit seulement qu'un autre compte l'a voulue) ; le lien ou le code validé (`POST /auth/flow/link` ou `/code`)
 * remplace l'adresse, et l'ancienne en est prévenue
 */
export interface StartEmailChange extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/me/email`;
		method: HttpMethodEnum.POST;
		protected: true;
		body: StartEmailChangeBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: FlowStatusDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]:
			| ValidationErrorResponseDto
			| ErrorResponseDto<
					AuthErrorCodeEnum.WRONG_PASSWORD | AuthErrorCodeEnum.EMAIL_UNCHANGED
			  >;
		// Plus aucun mail ne part aujourd'hui
		[HttpStatutCodeErrorEnum.FORBIDDEN]: ErrorResponseDto<AuthErrorCodeEnum.MAIL_CLOSED>;
		// Mauvais mot de passe répété, ou trop de mails pour cette adresse ou cette IP : Retry-After dit quand réessayer
		[HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS]:
			| ErrorResponseDto<AuthErrorCodeEnum.TOO_MANY_ATTEMPTS>
			| TooManyRequestsResponseDto;
		[HttpStatutCodeErrorEnum.SERVICE_UNAVAILABLE]: ErrorResponseDto<AuthErrorCodeEnum.AUTH_BUSY>;
	};
}
