import type { EndpointModel } from "../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { TestDto } from "../dto/test.dto.ts";

export interface CreateTest extends EndpointModel {
	request: {
		url: "/test";
		method: HttpMethodEnum.POST;
		protected: false;
		body: {
			name: string;
		};
	};
	response: {
		status: HttpStatutCodeSuccessEnum.CREATED;
		data: TestDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER]: null;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: null;
	};
}
