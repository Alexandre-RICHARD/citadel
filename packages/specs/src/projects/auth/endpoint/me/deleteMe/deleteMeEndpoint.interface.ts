import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { AuthErrorCodeEnum } from "../../../error/authErrorCode.enum.ts";
import type { DeleteMeBodyDto } from "./deleteMeBodyDto.type.ts";

/**
 * Supprime le compte et tout ce qui s'y rattache, immédiatement et sans retour possible. Mot de passe redemandé, et un
 * code de l'application d'authentification (ou un code de secours) si le compte en a une. Le cookie de session est
 * effacé, et un email confirme la suppression
 */
export interface DeleteMe extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/me`;
		method: HttpMethodEnum.DELETE;
		protected: true;
		body: DeleteMeBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.NO_CONTENT;
		data: null;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]:
			| ValidationErrorResponseDto
			| ErrorResponseDto<
					| AuthErrorCodeEnum.WRONG_PASSWORD
					| AuthErrorCodeEnum.SECOND_FACTOR_REQUIRED
					| AuthErrorCodeEnum.INVALID_CODE
			  >;
		// Délai après un mauvais mot de passe ou un mauvais code, ou bannissement temporaire : Retry-After dit quand réessayer
		[HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS]: ErrorResponseDto<AuthErrorCodeEnum.TOO_MANY_ATTEMPTS>;
		[HttpStatutCodeErrorEnum.SERVICE_UNAVAILABLE]: ErrorResponseDto<AuthErrorCodeEnum.AUTH_BUSY>;
	};
}
