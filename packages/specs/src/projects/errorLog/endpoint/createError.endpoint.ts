import type { EndpointModel } from "../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../specUtils/httpStatutCodeSuccess.enum.ts";

export interface CreateErrorLog extends EndpointModel {
	request: {
		url: "/error/error";
		method: HttpMethodEnum.POST;
		protected: false;
		body: {
			errorType: string;
			message: string;
			stack: string;
		};
	};
	response: {
		status: HttpStatutCodeSuccessEnum.CREATED;
		data: null;
	};
	error: {
		[HttpStatutCodeErrorEnum.SERVER_ERROR]: null;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: null;
	};
}
