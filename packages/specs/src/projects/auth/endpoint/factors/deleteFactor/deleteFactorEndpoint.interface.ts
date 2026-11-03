import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { AuthErrorCodeEnum } from "../../../error/authErrorCode.enum.ts";
import type { DeleteFactorBodyDto } from "./deleteFactorBodyDto.type.ts";
import type { DeleteFactorPathParamDto } from "./deleteFactorPathParamDto.type.ts";

// Retire un facteur, mot de passe redemandé. Le dernier parti, la double authentification l'est aussi, et les codes de
// secours avec elle
export interface DeleteFactor extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/factors/:factorId`;
		method: HttpMethodEnum.DELETE;
		protected: true;
		pathParams: DeleteFactorPathParamDto;
		body: DeleteFactorBodyDto;
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
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<AuthErrorCodeEnum.FACTOR_NOT_FOUND>;
		// Délai après un mauvais mot de passe, ou bannissement temporaire : Retry-After dit quand réessayer
		[HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS]: ErrorResponseDto<AuthErrorCodeEnum.TOO_MANY_ATTEMPTS>;
		[HttpStatutCodeErrorEnum.SERVICE_UNAVAILABLE]: ErrorResponseDto<AuthErrorCodeEnum.AUTH_BUSY>;
	};
}
