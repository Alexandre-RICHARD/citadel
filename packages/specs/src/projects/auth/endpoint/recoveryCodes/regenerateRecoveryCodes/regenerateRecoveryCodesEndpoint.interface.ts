import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { RecoveryCodesDto } from "../../../dto/recoveryCodesDto.type.ts";
import type { AuthErrorCodeEnum } from "../../../error/authErrorCode.enum.ts";
import type { RegenerateRecoveryCodesBodyDto } from "./regenerateRecoveryCodesBodyDto.type.ts";

// De nouveaux codes de secours, mot de passe redemandé : les anciens, utilisés ou non, ne valent plus
export interface RegenerateRecoveryCodes extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/recovery-codes`;
		method: HttpMethodEnum.POST;
		protected: true;
		body: RegenerateRecoveryCodesBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: RecoveryCodesDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]:
			| ValidationErrorResponseDto
			| ErrorResponseDto<
					AuthErrorCodeEnum.WRONG_PASSWORD | AuthErrorCodeEnum.NO_SECOND_FACTOR
			  >;
		// Délai après un mauvais mot de passe, ou bannissement temporaire : Retry-After dit quand réessayer
		[HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS]: ErrorResponseDto<AuthErrorCodeEnum.TOO_MANY_ATTEMPTS>;
		[HttpStatutCodeErrorEnum.SERVICE_UNAVAILABLE]: ErrorResponseDto<AuthErrorCodeEnum.AUTH_BUSY>;
	};
}
