import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponse.dto.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponse.dto.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { DeathDto } from "../../../dto/death/death.dto.ts";
import type { UpdateDeathBodyDto } from "./updateDeathBody.dto.ts";
import type { UpdateDeathPathParamDto } from "./updateDeathPathParam.dto.ts";

export interface UpdateDeath extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/deaths/:id`;
		method: HttpMethodEnum.PATCH;
		protected: false;
		pathParams: UpdateDeathPathParamDto;
		body: UpdateDeathBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: DeathDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: ErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
	};
}
