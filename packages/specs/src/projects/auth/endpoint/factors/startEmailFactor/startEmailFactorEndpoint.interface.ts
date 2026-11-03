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

/**
 * Commence l'activation du code par email : un parcours `email_factor`, dont le mail (lien + code) part à l'adresse du
 * compte. Le lien ou le code validé (`POST /auth/flow/link` ou `/code`) active le facteur
 */
export interface StartEmailFactor extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/factors/email`;
		method: HttpMethodEnum.POST;
		protected: true;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: FlowStatusDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		// Plus aucun mail ne part aujourd'hui
		[HttpStatutCodeErrorEnum.FORBIDDEN]: ErrorResponseDto<AuthErrorCodeEnum.MAIL_CLOSED>;
		[HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER]: ErrorResponseDto<AuthErrorCodeEnum.EMAIL_FACTOR_ALREADY_ACTIVE>;
		[HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS]: TooManyRequestsResponseDto;
	};
}
