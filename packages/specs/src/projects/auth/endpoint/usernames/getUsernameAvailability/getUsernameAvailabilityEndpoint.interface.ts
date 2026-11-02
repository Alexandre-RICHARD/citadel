import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { TooManyRequestsResponseDto } from "../../../../../specUtils/error/tooManyRequestsResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { UsernameAvailabilityDto } from "../../../dto/usernameAvailabilityDto.type.ts";
import type { GetUsernameAvailabilityPathParamDto } from "./getUsernameAvailabilityPathParamDto.type.ts";

// Le bouton « Vérifier la disponibilité » de l'inscription. Les pseudos sont publics par nature ; limité par IP pour
// qu'un robot ne les liste pas tous
export interface GetUsernameAvailability extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.AUTH}/usernames/:username/availability`;
		method: HttpMethodEnum.GET;
		protected: false;
		pathParams: GetUsernameAvailabilityPathParamDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: UsernameAvailabilityDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.TOO_MANY_REQUESTS]: TooManyRequestsResponseDto;
	};
}
