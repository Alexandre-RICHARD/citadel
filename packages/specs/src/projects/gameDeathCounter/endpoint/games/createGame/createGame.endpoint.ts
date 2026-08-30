import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { GameSummaryDto } from "../../../dto/game/gameSummary.dto.ts";
import type { CreateGameBodyDto } from "./createGameBody.dto.ts";

export interface CreateGame extends EndpointModel {
	request: {
		url: "/gameDeathCounter/games";
		method: HttpMethodEnum.POST;
		protected: false;
		body: CreateGameBodyDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.CREATED;
		data: GameSummaryDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: null;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: null;
	};
}
