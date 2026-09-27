import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponse.dto.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponse.dto.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { BossDto } from "../../../dto/boss/boss.dto.ts";
import type { GetOneBossPathParamDto } from "./getOneBossPathParam.dto.ts";

export interface GetOneBoss extends EndpointModel {
	request: {
		url: "/gameDeathCounter/bosses/:id";
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
