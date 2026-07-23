import type { EndpointModel } from "../../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../../specUtils/httpStatutCodeSuccess.enum.ts";

export interface DeleteDeath extends EndpointModel {
	request: {
		url: "/gameDeathCounter/deaths/:id";
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
