import type { EndpointModel } from "@specs/specUtils/endpointModel.type";
import { HttpMethodEnum } from "@specs/specUtils/httpMethod.enum";

import { buildQueryString } from "./buildQueryParamsUrl";
import { insertParamsInRequestUrl } from "./insertParamsInRequestUrl";

export async function fetchHandler<Spec extends EndpointModel>(
	args: Spec["request"],
): Promise<Spec["response"]> {
	const urlDomain = import.meta.env.VITE_API_ADRESS;
	const urlWithPathParams = insertParamsInRequestUrl({
		baseUrl: args.url,
		params: args.pathParams,
	});
	const urlQueryString = buildQueryString(args.queryParams);
	const finalUrl = `${urlDomain}${urlWithPathParams}${urlQueryString}`;

	const isBody =
		![HttpMethodEnum.GET, HttpMethodEnum.DELETE].includes(args.method) &&
		args.body !== undefined &&
		args.body !== null;

	const headers = new Headers({ "Content-Type": "application/json" });

	if (args.protected) {
		headers.set("Authorization", `Bearer ${"FakeToken"}`);
	}

	const res = await fetch(finalUrl, {
		headers,
		method: args.method,
		body: isBody ? JSON.stringify(args.body) : null,
	});

	if (!res.ok) {
		throw new Error(`HTTP ${res.status} ${res.statusText}`);
	}

	return res.json() as Promise<Spec["response"]>;
}
