import type { EndpointModel } from "../../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../specUtils/httpStatutCodeSuccess.enum.ts";

export interface DeleteBoss extends EndpointModel {
	request: {
		url: "/gameDeathCounter/bosses/:id";
		method: HttpMethodEnum.DELETE;
		protected: false;
		pathParams: { id: string };
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: null;
	};
	error: {
		[HttpStatutCodeErrorEnum.NOT_FOUND]: null;
	};
}
