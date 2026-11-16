import type { z } from "zod";

import { requestJson } from "../http/requestJson.ts";

/**
 * Une lecture de l'API v3 de Radarr ou de Sonarr, avec sa clé d'API en en-tête (jamais dans l'adresse). Lecture seule :
 * le job ne leur demande jamais rien d'autre
 */
export function createArrGetter(
	name: string,
	{ url, apiKey }: { url: string; apiKey: string },
) {
	return function get<Schema extends z.ZodType>(
		path: string,
		schema: Schema,
		parameters: Record<string, string> = {},
	): Promise<z.infer<Schema>> {
		const query = new URLSearchParams(parameters).toString();
		return requestJson(
			name,
			`${url}/api/v3${path}${query === "" ? "" : `?${query}`}`,
			schema,
			{ headers: { "X-Api-Key": apiKey } },
		);
	};
}
