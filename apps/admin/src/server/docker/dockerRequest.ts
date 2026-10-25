import { env } from "../configuration/env.ts";
import { HttpError } from "../http/HttpError.ts";

// 304 : déjà démarré, ou déjà arrêté. Pas une erreur pour la console.
const NOT_MODIFIED = 304;

// Une requête à l'API de Docker, à travers infra-socket-proxy. Le filtre refuse (403)
// tout ce qui n'est pas dans sa liste : lire l'état, les statistiques et les logs ;
// démarrer, arrêter. Chemins sans numéro de version : la version courante de Docker.
// Délai long : un arrêt attend que le conteneur s'arrête (jusqu'à 10 s, plus pour certains).
export async function dockerRequest(
	path: string,
	init: RequestInit = {},
): Promise<Response> {
	let response: Response;
	try {
		response = await fetch(`${env.DOCKER_API_URL}${path}`, {
			...init,
			signal: AbortSignal.timeout(60_000),
		});
	} catch (error) {
		console.error(`Docker injoignable (${path}) :`, error);
		throw new HttpError(502, "Docker injoignable (infra-socket-proxy)");
	}
	if (response.ok || response.status === NOT_MODIFIED) return response;

	// Docker explique ses refus en JSON ({"message": …}) ; le filtre, en texte
	const text = await response.text();
	let message = text;
	try {
		message = (JSON.parse(text) as { message?: string }).message ?? text;
	} catch {
		// Texte brut : gardé tel quel
	}
	throw new HttpError(502, `Docker : ${message.trim() || response.statusText}`);
}
