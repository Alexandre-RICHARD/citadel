import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponse.dto.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponse.dto.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { DeathDto } from "../../../dto/death/death.dto.ts";
import type { AddDeathPathParamDto } from "./addDeathPathParam.dto.ts";

export interface AddDeath extends EndpointModel {
	request: {
		url: "/gameDeathCounter/bosses/:bossId/deaths";
		method: HttpMethodEnum.POST;
		protected: false;
		pathParams: AddDeathPathParamDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.CREATED;
		data: DeathDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: ErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto;
	};
}
