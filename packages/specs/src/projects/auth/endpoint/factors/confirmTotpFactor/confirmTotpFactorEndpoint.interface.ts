import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { FactorActivationDto } from "../../../dto/factorActivationDto.type.ts";
import type { AuthErrorCodeEnum } from "../../../error/authErrorCode.enum.ts";
import type { ConfirmTotpFactorBodyDto } from "./confirmTotpFactorBodyDto.type.ts";

// Le premier code de l'application active le TOTP ; premier facteur du compte, il donne aussi les codes de secours
export interface ConfirmTotpFactor extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/factors/totp/confirm`;
		method: HttpMethodEnum.POST;
		protected: true;
		body: ConfirmTotpFactorBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: FactorActivationDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]:
			| ValidationErrorResponseDto
			| ErrorResponseDto<AuthErrorCodeEnum.INVALID_CODE>;
		// Aucun TOTP de ce compte n'attend son premier code sous cet id : déjà actif, effacé faute de code à temps
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<AuthErrorCodeEnum.FACTOR_NOT_FOUND>;
	};
}
