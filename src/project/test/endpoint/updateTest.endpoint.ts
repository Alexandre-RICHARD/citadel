import type { EndpointModel } from "../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../specUtils/httpMethod.enum.ts";
import type { HttpStatutCodeErrorEnum } from "../../../specUtils/httpStatutCodeError.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "../../../specUtils/httpStatutCodeSuccess.enum.ts";
import type { TestDto } from "../dto/test.dto.ts";

export interface UpdateTest extends EndpointModel {
	request: {
		url: "/test/:id";
		method: HttpMethodEnum.PUT;
		protected: false;
		pathParams: {
			id: string;
		};
		body: {
			name: string;
			isActive: boolean;
		};
	};
	response: {
		status: HttpStatutCodeSuccessEnum.SUCCESS;
		data: TestDto;
	};
	error: {
		[HttpStatutCodeErrorEnum.NOT_FOUND]: null;
		[HttpStatutCodeErrorEnum.CONFLICT_WITH_SERVER]: null;
		[HttpStatutCodeErrorEnum.BAD_REQUEST]: null;
	};
}
