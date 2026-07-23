import type { EndpointModel } from "../../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { GameSummaryDto } from "../../dto/gameSummary.dto.ts";

export interface CreateGame extends EndpointModel {
	request: {
		url: "/gameDeathCounter/games";
		method: HttpMethodEnum.POST;
		protected: false;
		body: {
			name: string;
		};
	};
	response: {
		status: HttpStatutCodeSuccessEnum.CREATED;
		data: GameSummaryDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: null;
	};
}
