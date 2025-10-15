import type { EndpointModel } from "../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../specUtils/httpMethod.enum.ts";
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
	response: TestDto;
}
