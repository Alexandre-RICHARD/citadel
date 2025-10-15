import type { EndpointModel } from "../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../specUtils/httpMethod.enum.ts";
import type { TestDto } from "../dto/test.dto.ts";

export interface GetAllTest extends EndpointModel {
	request: {
		url: "/test";
		method: HttpMethodEnum.GET;
		protected: false;
	};
	response: TestDto[];
}
