import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { ErrorResponseDto } from "../../../../../specUtils/error/errorResponse.dto.ts";
import type { ValidationErrorResponseDto } from "../../../../../specUtils/error/validationErrorResponse.dto.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { GameSummaryDto } from "../../../dto/game/gameSummary.dto.ts";
import type { UpdateGameBodyDto } from "./updateGameBody.dto.ts";
import type { UpdateGamePathParamDto } from "./updateGamePathParam.dto.ts";

export interface UpdateGame extends EndpointModel {
	request: {
		url: "/gameDeathCounter/games/:id";
		method: HttpMethodEnum.PUT;
		protected: false;
		pathParams: UpdateGamePathParamDto;
		body: UpdateGameBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: GameSummaryDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: ErrorResponseDto;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: ErrorResponseDto;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: ValidationErrorResponseDto;
	};
}
