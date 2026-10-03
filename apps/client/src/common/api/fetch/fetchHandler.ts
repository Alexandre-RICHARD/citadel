import type { EndpointModel } from "@citadel/specs/src/specUtils/endpointModel.type";
import type { ValidationIssueDto } from "@citadel/specs/src/specUtils/error/validationIssueDto.type";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum";

import { ApiError } from "../error/ApiError";
import { buildQueryString } from "./buildQueryString";
import { insertParamsInRequestUrl } from "./insertParamsInRequestUrl";

type Options = {
	// Domaine de l'API, VITE_API_ADRESS par défaut
	urlDomain?: string;
	// Fourni par TanStack Query pour interrompre une requête devenue inutile
	signal?: AbortSignal;
};

type ErrorBody = Pick<ApiError, "code" | "issues">;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

// Corps au format ErrorResponseDto ; sinon (page HTML d'un proxy…), ni code ni issues
async function readErrorBody(response: Response): Promise<ErrorBody> {
	try {
		const body: unknown = await response.json();
		if (isRecord(body) && typeof body.code === "string")
			return {
				code: body.code,
				issues: Array.isArray(body.issues)
					? (body.issues as ValidationIssueDto[])
					: [],
			};
	} catch {
		// Corps vide ou non JSON : traité comme une réponse sans code
	}
	return { code: null, issues: [] };
}

export async function fetchHandler<Spec extends EndpointModel>(
	request: Spec["request"],
	{ urlDomain = import.meta.env.VITE_API_ADRESS, signal }: Options = {},
): Promise<Spec["response"]> {
	const urlWithPathParams = insertParamsInRequestUrl({
		baseUrl: request.url,
		params: request.pathParams,
	});
	const url = `${urlDomain}${urlWithPathParams}${buildQueryString(request.queryParams)}`;

	const hasBody =
		![HttpMethodEnum.GET, HttpMethodEnum.DELETE].includes(request.method) &&
		request.body !== undefined &&
		request.body !== null;

	// Sans corps, pas de Content-Type : un GET reste une requête simple, sans preflight CORS
	const headers = new Headers();
	if (hasBody) headers.set("Content-Type", "application/json");
	if (request.protected) headers.set("Authorization", `Bearer ${"FakeToken"}`); // TODO TOKEN JWT

	let response: Response;
	try {
		response = await fetch(url, {
			headers,
			method: request.method,
			body: hasBody ? JSON.stringify(request.body) : null,
			signal: signal ?? null,
		});
	} catch (error) {
		// Une annulation n'est pas un échec : TanStack Query l'attend telle quelle
		if (signal?.aborted) throw error;
		throw new ApiError({ status: null, code: null, cause: error });
	}

	if (!response.ok)
		throw new ApiError({
			status: response.status,
			...(await readErrorBody(response)),
		});

	// Un 204 n'a pas de corps : data vaut null, comme le déclare l'interface de l'endpoint
	const data: unknown =
		response.status === Number(HttpStatutCodeSuccessEnum.NO_CONTENT)
			? null
			: await response.json();

	return { status: response.status, data } as Spec["response"];
}
