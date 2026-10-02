import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { DeathDto } from "../../../dto/death/deathDto.ts";
import type { UpdateDeathBodyDto } from "./updateDeathBodyDto.ts";
import type { UpdateDeathPathParamDto } from "./updateDeathPathParamDto.ts";

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
