import type { EndpointModel } from "../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { TestDto } from "../dto/test.dto.ts";

export interface GetOneTest extends EndpointModel {
	request: {
		url: "/test/:id";
		method: HttpMethodEnum.GET;
		protected: false;
		pathParams: {
			id: string;
		};
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: TestDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.NOT_FOUND]: null;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: null;
	};
}
