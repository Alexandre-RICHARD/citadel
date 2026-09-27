import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { GameSummaryDto } from "../../../dto/game/gameSummary.dto.ts";
import type { SetGameFinishedBodyDto } from "./setGameFinishedBody.dto.ts";
import type { SetGameFinishedPathParamDto } from "./setGameFinishedPathParam.dto.ts";

export interface SetGameFinished extends EndpointModel {
	request: {
		url: "/gameDeathCounter/games/:id/finished";
		method: HttpMethodEnum.PATCH;
		protected: false;
		pathParams: SetGameFinishedPathParamDto;
		body: SetGameFinishedBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: GameSummaryDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: null;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: null;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: null;
	};
}
