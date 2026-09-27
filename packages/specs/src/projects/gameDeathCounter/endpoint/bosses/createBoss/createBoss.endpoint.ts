import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponse.dto.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponse.dto.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { BossSummaryDto } from "../../../dto/boss/bossSummary.dto.ts";
import type { CreateBossBodyDto } from "./createBossBody.dto.ts";
import type { CreateBossPathParamDto } from "./createBossPathParam.dto.ts";

export interface CreateBoss extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/:gameId/bosses`;
		method: HttpMethodEnum.POST;
		protected: false;
		pathParams: CreateBossPathParamDto;
		body: CreateBossBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.CREATED;
		data: BossSummaryDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: ErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto;
	};
}
