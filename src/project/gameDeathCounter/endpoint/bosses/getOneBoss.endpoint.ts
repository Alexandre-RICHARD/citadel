import type { EndpointModel } from "../../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { BossDto } from "../../dto/boss.dto.ts";

export interface GetOneBoss extends EndpointModel {
	request: {
		url: "/gameDeathCounter/bosses/:id";
		method: HttpMethodEnum.GET;
		protected: false;
		pathParams: { id: string };
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: BossDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.NOT_FOUND]: null;
	};
}
