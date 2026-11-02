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
import type { StartMailLoginBodyDto } from "./startMailLoginBodyDto.type.ts";

// « Recevoir un lien de connexion par email » : le mail remplace le mot de passe, jamais l'application d'authentification.
// Réponse neutre : la même pour un identifiant inconnu ou un compte qui a fermé la connexion par email, sans mail
export interface StartMailLogin extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/login/mail`;
		method: HttpMethodEnum.POST;
		protected: false;
		body: StartMailLoginBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: FlowStatusDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		// Plus aucun mail ne part aujourd'hui, pour tout le monde
		[HttpStatutCodeErrorEnum.FORBIDDEN]: ErrorResponseDto<AuthErrorCodeEnum.MAIL_CLOSED>;
		[HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS]: TooManyRequestsResponseDto;
	};
}
