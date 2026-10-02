import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { BossDto } from "../../../dto/boss/bossDto.ts";
import type { GetOneBossPathParamDto } from "./getOneBossPathParamDto.ts";

export interface GetOneBoss extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/:id`;
		method: HttpMethodEnum.GET;
		protected: false;
		pathParams: GetOneBossPathParamDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: BossDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: ErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto;
	};
}
