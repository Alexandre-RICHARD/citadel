import type { MailFailureSummary } from "../../shared/mailFailureSummary.type.ts";
import { env } from "../configuration/env.ts";
import { fetchWithTimeout } from "../http/fetchWithTimeout.ts";

// Le serveur du site, appelé directement par le réseau Docker : Caddy ne laisse pas passer /api/internal. Injoignable :
// null, sans erreur
export async function readMailFailureSummary(): Promise<MailFailureSummary | null> {
	try {
		const response = await fetchWithTimeout(
			`${env.SITE_API_URL}/internal/mail/failures`,
		);
		if (!response.ok) return null;
		return (await response.json()) as MailFailureSummary;
	} catch {
		return null;
	}
}
