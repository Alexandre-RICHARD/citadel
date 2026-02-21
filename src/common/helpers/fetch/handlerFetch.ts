import type { EndpointModel } from "@specs/specUtils/endpointModel.type";
import { HttpMethodEnum } from "@specs/specUtils/httpMethod.enum";

import { buildQueryString } from "./buildQueryParamsUrl";
import { insertParamsInRequestUrl } from "./insertParamsInRequestUrl";

class HttpStatusError extends Error {
	constructor(
		public status: number,
		message?: string,
	) {
		super(message ?? `HTTP ${status}`);
		this.name = "HttpStatusError";
	}
}

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
		const msg = `HTTP ${response.status} ${response.statusText}`;
		throw new HttpStatusError(response.status, msg);
	}

	return {
		status: response.status,
		data: await response.json(),
	} as Spec["response"];
}
