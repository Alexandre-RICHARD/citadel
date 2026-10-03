import type { ApiPrefixEnum } from "../../../../../specUtils/apiPrefix.enum.ts";
import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponseDto.type.ts";
import type { InternalErrorResponseDto } from "../../../../../specUtils/error/internalErrorResponseDto.type.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponseDto.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { BossSummaryDto } from "../../../dto/boss/bossSummaryDto.type.ts";
import type { GameDeathCounterErrorCodeEnum } from "../../../error/gameDeathCounterErrorCode.enum.ts";
import type { UpdateBossBodyDto } from "./updateBossBodyDto.type.ts";
import type { UpdateBossPathParamDto } from "./updateBossPathParamDto.type.ts";

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
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: InternalErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto<
			| GameDeathCounterErrorCodeEnum.GAME_NOT_FOUND
			| GameDeathCounterErrorCodeEnum.BOSS_NOT_FOUND
		>;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
	};
}
