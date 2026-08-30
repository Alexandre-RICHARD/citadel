import type { EndpointModel } from "@specs/specUtils/endpointModel.type";
import { HttpMethodEnum } from "@specs/specUtils/httpMethod.enum.ts";

import { ApiError } from "../../error/ApiError.ts";
import { buildQueryString } from "./buildQueryParamsUrl.ts";
import { insertParamsInRequestUrl } from "./insertParamsInRequestUrl.ts";

export async function fetchHandler<Spec extends EndpointModel>(
	args: Spec["request"],
	urlDomain?: string,
): Promise<Spec["response"]> {
	const determinedUrlDomain = urlDomain ?? import.meta.env.VITE_API_ADRESS;
	const urlWithPathParams = insertParamsInRequestUrl({
		baseUrl: args.url,
		params: args.pathParams,
	});
	const urlQueryString = buildQueryString(args.queryParams);
	const finalUrl = `${determinedUrlDomain}${urlWithPathParams}${urlQueryString}`;

	const isBody =
		![HttpMethodEnum.GET, HttpMethodEnum.DELETE].includes(args.method) &&
		args.body !== undefined &&
		args.body !== null;

	const headers = new Headers({ "Content-Type": "application/json" });

	if (args.protected) {
		headers.set("Authorization", `Bearer ${"FakeToken"}`);
	}

	const response = await fetch(finalUrl, {
		headers,
		method: args.method,
		body: isBody ? JSON.stringify(args.body) : null,
	});

	if (!response.ok) {
		let body: unknown;
		try {
			body = await response.json();
		} catch {
			throw new ApiError(500, "Unexpected error");
		}
		throw new ApiError(response.status, body);
	}

	return {
		status: response.status,
		data: await response.json(),
	} as Spec["response"];
}
