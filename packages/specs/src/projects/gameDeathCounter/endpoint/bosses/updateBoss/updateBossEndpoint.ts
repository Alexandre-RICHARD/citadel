import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { BossSummaryDto } from "../../../dto/boss/bossSummaryDto.ts";
import type { UpdateBossBodyDto } from "./updateBossBodyDto.ts";
import type { UpdateBossPathParamDto } from "./updateBossPathParamDto.ts";

export interface UpdateBoss extends EndpointModel {
	request: {
		url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/:id`;
		method: HttpMethodEnum.PUT;
		protected: false;
		pathParams: UpdateBossPathParamDto;
		body: UpdateBossBodyDto;
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
