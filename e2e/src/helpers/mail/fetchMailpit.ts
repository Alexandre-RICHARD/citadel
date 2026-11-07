import { E2EUrlEnum } from "../../dictionaries/e2eUrl.enum.ts";

/** Une requête GET vers l'API de Mailpit (infra/compose.e2e.yml), réponse JSON */
export async function fetchMailpit<T>(path: string): Promise<T> {
	const response = await fetch(`${E2EUrlEnum.MAILPIT_API}${path}`);
	if (!response.ok)
		throw new Error(`Mailpit ${path} a répondu ${response.status}`);
	return (await response.json()) as T;
}
