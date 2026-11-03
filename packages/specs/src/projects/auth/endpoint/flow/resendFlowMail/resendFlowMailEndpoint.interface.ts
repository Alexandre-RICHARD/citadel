import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { TooManyRequestsResponseDto } from "../../../../../specUtils/error/tooManyRequestsResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { FlowStatusDto } from "../../../dto/flowStatusDto.type.ts";
import type { AuthErrorCodeEnum } from "../../../error/authErrorCode.enum.ts";

// Renvoie le mail de l'étape : un nouveau lien et un nouveau code, l'ancien code ne vaut plus et les essais repartent de
// zéro. À l'étape « second facteur » d'une connexion par mot de passe, envoie le code par email du compte qui en a un.
// Pas avant le délai de renvoi (Retry-After), ni au-delà des limites de mails
export interface ResendFlowMail extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/flow/resend`;
		method: HttpMethodEnum.POST;
		protected: false;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: FlowStatusDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		// Plus de parcours dans ce navigateur, ou son étape n'envoie pas de mail
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ErrorResponseDto<AuthErrorCodeEnum.FLOW_EXPIRED>;
		// Le quota quotidien de mails a fermé les inscriptions, ou tous les mails de l'authentification
		[HttpStatutCodeErrorEnum.FORBIDDEN]: ErrorResponseDto<
			AuthErrorCodeEnum.REGISTRATION_CLOSED | AuthErrorCodeEnum.MAIL_CLOSED
		>;
		[HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS]: TooManyRequestsResponseDto;
	};
}
