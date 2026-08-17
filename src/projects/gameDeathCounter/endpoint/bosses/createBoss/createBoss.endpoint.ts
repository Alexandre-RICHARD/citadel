import type { EndpointModel } from "../../../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { BossSummaryDto } from "../../../dto/boss/bossSummary.dto.ts";

export interface CreateBoss extends EndpointModel {
	request: {
		url: "/gameDeathCounter/bosses";
		method: HttpMethodEnum.POST;
		protected: false;
		body: {
			name: string;
			gameId: number;
		};
	};
	response: {
		status: HttpStatutCodeSuccessEnum.CREATED;
		data: BossSummaryDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: null;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: null;
		[HttpStatutCodeErrorEnum.NOT_FOUND]: null;
	};
}
