import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { AuthErrorCodeEnum } from "../../../error/authErrorCode.enum.ts";
import type { DeleteProjectDataBodyDto } from "./deleteProjectDataBodyDto.type.ts";
import type { DeleteProjectDataPathParamDto } from "./deleteProjectDataPathParamDto.type.ts";

/**
 * Supprime toutes les données du compte dans un projet, immédiatement et sans retour possible ; le compte reste. Mot de
 * passe redemandé. Sans aucune donnée dans le projet, la réponse est la même
 */
export interface DeleteProjectData extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/me/projects/:project`;
		method: HttpMethodEnum.DELETE;
		protected: true;
		pathParams: DeleteProjectDataPathParamDto;
		body: DeleteProjectDataBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.NO_CONTENT;
		data: null;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]:
			| ValidationErrorResponseDto
			| ErrorResponseDto<AuthErrorCodeEnum.WRONG_PASSWORD>;
		// Délai après un mauvais mot de passe, ou bannissement temporaire : Retry-After dit quand réessayer
		[HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS]: ErrorResponseDto<AuthErrorCodeEnum.TOO_MANY_ATTEMPTS>;
		[HttpStatutCodeErrorEnum.SERVICE_UNAVAILABLE]: ErrorResponseDto<AuthErrorCodeEnum.AUTH_BUSY>;
	};
}
