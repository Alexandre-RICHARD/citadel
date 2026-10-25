import type { ApiErrorBody } from "../../shared/apiErrorBody.type";
import { ApiError } from "./ApiError";
import { UNAUTHORIZED_EVENT } from "./unauthorizedEvent";

async function errorMessage(response: Response): Promise<string> {
	try {
		return ((await response.json()) as ApiErrorBody).message;
	} catch {
		return `Erreur ${response.status}`;
	}
}

// Tous les appels à l'API de la console. Le cookie de session part seul (même origine).
// Réponse JSON, texte (logs) ou rien (204).
export async function apiRequest<T>(
	path: string,
	init: { method?: "GET" | "POST"; body?: unknown } = {},
): Promise<T> {
	let response: Response;
	try {
		response = await fetch(
			`/api${path}`,
			init.body === undefined
				? { method: init.method ?? "GET" }
				: {
						method: init.method ?? "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(init.body),
					},
		);
	} catch {
		throw new ApiError(0, "Console injoignable");
	}

	if (response.status === 401 && path !== "/login")
		window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
	if (!response.ok)
		throw new ApiError(response.status, await errorMessage(response));
	if (response.status === 204) return undefined as T;
	if (response.headers.get("Content-Type")?.includes("application/json"))
		return (await response.json()) as T;
	return (await response.text()) as T;
}
