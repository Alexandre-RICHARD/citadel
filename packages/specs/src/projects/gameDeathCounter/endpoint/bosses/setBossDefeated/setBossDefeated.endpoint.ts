import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponse.dto.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponse.dto.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { BossSummaryDto } from "../../../dto/boss/bossSummary.dto.ts";
import type { SetBossDefeatedBodyDto } from "./setBossDefeatedBody.dto.ts";
import type { SetBossDefeatedPathParamDto } from "./setBossDefeatedPathParam.dto.ts";

export interface SetBossDefeated extends EndpointModel {
	request: {
		url: "/gameDeathCounter/bosses/:id/defeated";
		method: HttpMethodEnum.PATCH;
		protected: false;
		pathParams: SetBossDefeatedPathParamDto;
		body: SetBossDefeatedBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: BossSummaryDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: ErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
	};
}
