import type { HttpMethodEnum } from "./httpMethod.enum.ts";
import type { PathParams } from "./pathParams.type.ts";
import type { QueryParams } from "./queryParams.type.ts";

export type EndpointModel = {
	request: {
		url: string;
		method: HttpMethodEnum;
		protected: boolean;
		pathParams?: PathParams;
		queryParams?: QueryParams;
		body?: unknown;
	};
	response: unknown;
};
