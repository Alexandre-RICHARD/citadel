import type { EndpointModel } from "../../../specUtils/endpointModel.type.ts";
import type { HttpMethodEnum } from "../../../specUtils/httpMethod.enum.ts";

export interface DeleteTest extends EndpointModel {
	request: {
		url: "/test/:id";
		method: HttpMethodEnum.DELETE;
		protected: false;
		pathParams: {
			id: string;
		};
	};
	response: null;
}
