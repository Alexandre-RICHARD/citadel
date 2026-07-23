import type { EndpointModel } from "../../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { DeathDto } from "../../dto/death.dto.ts";

export interface AddDeath extends EndpointModel {
	request: {
		url: "/gameDeathCounter/bosses/:id/deaths";
		method: HttpMethodEnum.POST;
		protected: false;
		pathParams: { id: string };
	};
	response: {
		status: HttpStatutCodeSuccessEnum.CREATED;
		data: DeathDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.NOT_FOUND]: null;
	};
}
