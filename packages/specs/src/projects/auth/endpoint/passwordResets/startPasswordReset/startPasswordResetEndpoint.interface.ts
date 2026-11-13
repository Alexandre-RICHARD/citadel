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
import type { StartPasswordResetBodyDto } from "./startPasswordResetBodyDto.type.ts";

// « Mot de passe oublié » : un lien et un code à l'adresse du compte, jamais affichée. Réponse neutre : la même pour un
// identifiant inconnu, sans email. Toujours ouvert, quelles que soient les méthodes de connexion du compte
export interface StartPasswordReset extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/password-resets`;
		method: HttpMethodEnum.POST;
		protected: false;
		body: StartPasswordResetBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: FlowStatusDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		// Plus aucun email ne part aujourd'hui, pour tout le monde
		[HttpStatutCodeErrorEnum.FORBIDDEN]: ErrorResponseDto<AuthErrorCodeEnum.MAIL_CLOSED>;
		[HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS]: TooManyRequestsResponseDto;
	};
}
