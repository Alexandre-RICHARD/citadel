import type { EndpointModel } from "../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../specUtils/httpMethod.enum.ts";

export interface PostTest extends EndpointModel {
	request: {
		url: "/test/unique/:id";
		method: HttpMethodEnum.POST;
		protected: true;
		pathParams: {
			id: string;
		};
		queryParams: {
			possibility: string;
		};
		body: {
			numero1: number;
			dateOfDay: Date;
		};
	};
	response: number[];
}
