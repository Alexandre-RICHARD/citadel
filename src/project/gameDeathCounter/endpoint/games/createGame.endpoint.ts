import type { EndpointModel } from "../../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { CreateGameDto } from "../../dto/game/createGame.dto.ts";
import type { GameSummaryDto } from "../../dto/game/gameSummary.dto.ts";

export interface CreateGame extends EndpointModel {
	request: {
		url: "/gameDeathCounter/games";
		method: HttpMethodEnum.POST;
		protected: false;
		body: CreateGameDto;
	};
	response: {
		status: HttpStatutCodeSuccessEnum.CREATED;
		data: GameSummaryDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: null;
	};
}
