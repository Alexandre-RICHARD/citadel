import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { BossSummaryDto } from "../../../dto/boss/bossSummary.dto.ts";

export interface UpdateBoss extends EndpointModel {
	request: {
		url: "/gameDeathCounter/bosses/:id";
		method: HttpMethodEnum.PATCH;
		protected: false;
		pathParams: { id: string };
		body: {
			name: string;
			gameId: number;
		};
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: BossSummaryDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: null;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: null;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: null;
	};
}
