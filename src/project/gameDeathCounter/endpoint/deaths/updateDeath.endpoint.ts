import type { EndpointModel } from "../../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { DeathDto } from "../../dto/death.dto.ts";

export interface UpdateDeath extends EndpointModel {
	request: {
		url: "/gameDeathCounter/deaths/:id";
		method: HttpMethodEnum.PATCH;
		protected: false;
		pathParams: { id: string };
		body: {
			comment?: string | null;
			date?: string;
		};
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: DeathDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.NOT_FOUND]: null;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: null;
	};
}
