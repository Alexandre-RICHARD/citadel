import { env } from "../configuration/env.ts";
import { fetchWithTimeout } from "../http/fetchWithTimeout.ts";

// Les messages de contact gardés en base faute d'avoir pu être notifiés. Le serveur du site est appelé directement par
// le réseau Docker (Caddy bloque /api/internal). Injoignable : null, sans erreur
export async function readUnsentContactCount(): Promise<number | null> {
	try {
		const response = await fetchWithTimeout(
			`${env.SITE_API_URL}/internal/contact/unsent`,
		);
		if (!response.ok) return null;
		const body = (await response.json()) as { count: number };
		return body.count;
	} catch {
		return null;
	}
}
