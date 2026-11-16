import type { z } from "zod";

import { requestWithRetry } from "./requestWithRetry.ts";

/**
 * Un appel qui rend du JSON, lu par son schéma : seuls les champs dont le job a besoin sont gardés, et un outil qui
 * changerait leur forme arrête le job plutôt que de fausser le relevé
 */
export async function requestJson<Schema extends z.ZodType>(
	name: string,
	url: string,
	schema: Schema,
	init: RequestInit = {},
): Promise<z.infer<Schema>> {
	const response = await requestWithRetry(name, url, init);
	const parsed = schema.safeParse(await response.json());
	if (!parsed.success)
		throw new Error(`${name} : réponse inattendue de ${new URL(url).pathname}`);
	return parsed.data;
}
