import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { DeathDto } from "../../../dto/death/deathDto.type.ts";
import type { GameDeathCounterErrorCodeEnum } from "../../../error/gameDeathCounterErrorCode.enum.ts";
import type { UpdateDeathBodyDto } from "./updateDeathBodyDto.type.ts";
import type { UpdateDeathPathParamDto } from "./updateDeathPathParamDto.type.ts";

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
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<GameDeathCounterErrorCodeEnum.DEATH_NOT_FOUND>;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
	};
}
