import { fetchWithTimeout } from "@citadel/common/src/universal/http/fetchWithTimeout.ts";

import type { MailFailureSummary } from "../../shared/mailFailureSummary.type.ts";
import { env } from "../configuration/env.ts";
import { SERVICE_TIMEOUT_MS } from "../http/serviceTimeoutMs.ts";

// Le serveur du site, appelé directement par le réseau Docker : Caddy ne laisse pas passer /api/internal. Injoignable :
// null, sans erreur
export async function readMailFailureSummary(): Promise<MailFailureSummary | null> {
	try {
		const response = await fetchWithTimeout(
			`${env.SITE_API_URL}/internal/mail/failures`,
			SERVICE_TIMEOUT_MS,
		);
		if (!response.ok) return null;
		return (await response.json()) as MailFailureSummary;
	} catch {
		return null;
	}
}
