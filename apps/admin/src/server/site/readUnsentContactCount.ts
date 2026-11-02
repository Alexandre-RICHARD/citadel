import { fetchWithTimeout } from "@citadel/common/src/universal/http/fetchWithTimeout.ts";

import { env } from "../configuration/env.ts";
import { SERVICE_TIMEOUT_MS } from "../http/serviceTimeoutMs.ts";

// Les messages de contact gardés en base faute d'avoir pu être notifiés. Le serveur du site est appelé directement par
// le réseau Docker (Caddy bloque /api/internal). Injoignable : null, sans erreur
export async function readUnsentContactCount(): Promise<number | null> {
	try {
		const response = await fetchWithTimeout(
			`${env.SITE_API_URL}/internal/contact/unsent`,
			SERVICE_TIMEOUT_MS,
		);
		if (!response.ok) return null;
		const body = (await response.json()) as { count: number };
		return body.count;
	} catch {
		return null;
	}
}
