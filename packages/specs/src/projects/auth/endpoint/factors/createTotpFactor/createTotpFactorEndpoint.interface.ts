import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { TotpFactorSetupDto } from "../../../dto/totpFactorSetupDto.type.ts";
import type { CreateTotpFactorBodyDto } from "./createTotpFactorBodyDto.type.ts";

/**
 * Ajoute une application d'authentification, nommée : un secret neuf, chiffré en base, donné cette seule fois. Le
 * facteur reste inactif jusqu'à son premier code (`POST /auth/factors/totp/confirm`), effacé s'il ne vient pas à temps
 */
export interface CreateTotpFactor extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/factors/totp`;
		method: HttpMethodEnum.POST;
		protected: true;
		body: CreateTotpFactorBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.CREATED;
		data: TotpFactorSetupDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
	};
}
