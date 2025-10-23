import type { HttpMethodEnum } from "./httpMethod.enum.ts";
import type { HttpStatutCodeSuccessEnum } from "./httpStatutCodeSuccess.enum.ts";
import type { PathParams } from "./pathParams.type.ts";
import type { QueryParams } from "./queryParams.type.ts";
import type { ResponseStatusErrorMap } from "./responseStatusErrorMap.type.ts";

export type EndpointModel = {
	request: {
		url: string;
		method: HttpMethodEnum;
		protected: boolean;
		pathParams?: PathParams;
		queryParams?: QueryParams;
		body?: unknown;
	};
	response: {
		status: HttpStatutCodeSuccessEnum;
		data: unknown;
	};
	error?: ResponseStatusErrorMap;
};
