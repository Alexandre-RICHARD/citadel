import type { PathParams } from "@citadel/specs/src/specUtils/pathParams.type";

type Args = {
	baseUrl: string;
	params: PathParams | undefined;
};

export function insertParamsInRequestUrl({ baseUrl, params }: Args): string {
	if (!params) return baseUrl;
	return baseUrl.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) => {
		const paramValue = params[key];
		if (paramValue === undefined) {
			throw new Error(`Missing path param ':${key}'`);
		}
		return encodeURIComponent(String(paramValue));
	});
}
