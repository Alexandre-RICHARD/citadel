import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { AuthErrorCodeEnum } from "../../../error/authErrorCode.enum.ts";
import type { DeleteSessionPathParamDto } from "./deleteSessionPathParamDto.type.ts";

// Déconnecte une session du compte, sans confirmation. Celle de la requête : le cookie est effacé aussi
export interface DeleteSession extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/sessions/:sessionId`;
		method: HttpMethodEnum.DELETE;
		protected: true;
		pathParams: DeleteSessionPathParamDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.NO_CONTENT;
		data: null;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		// Aucune session de ce compte sous cet id (jamais celle d'un autre)
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<AuthErrorCodeEnum.SESSION_NOT_FOUND>;
	};
}
