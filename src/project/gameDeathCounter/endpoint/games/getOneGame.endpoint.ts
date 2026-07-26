import type { EndpointModel } from "../../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { GameDto } from "../../dto/game/game.dto.ts";

export interface GetOneGame extends EndpointModel {
	request: {
		url: "/gameDeathCounter/games/:id";
		method: HttpMethodEnum.GET;
		protected: false;
		pathParams: { id: string };
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: GameDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.NOT_FOUND]: null;
	};
}
