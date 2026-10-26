import type { DeadlineItem } from "../../shared/deadlineItem.type.ts";
import { env } from "../configuration/env.ts";
import { readTailscaleStateFile } from "../tailscale/readTailscaleStateFile.ts";
import { readCertificateExpiry } from "./readCertificateExpiry.ts";

// La clé du NAS dans ton tailnet : sans expiration (§12.4, P19). Une date ici veut dire
// que le réglage a sauté, et que le NAS sortira du tailnet ce jour-là.
async function readTailscaleKeyExpiry(): Promise<DeadlineItem> {
	const label = "Clé Tailscale du NAS";
	const state = await readTailscaleStateFile();
	if (!state) return { label, expiresAt: null, problem: "aucun relevé" };
	return { label, expiresAt: state.selfKeyExpiry, problem: null };
}

// Fonctionnalité 8 (§14.3). Le quota du Drive s'ajoutera avec les sauvegardes (étape 30).
export function readDeadlines(): Promise<DeadlineItem[]> {
	const domain = env.SITE_DOMAIN;
	return Promise.all([
		readCertificateExpiry(domain),
		readCertificateExpiry(`www.${domain}`),
		readCertificateExpiry(`jellyfin.${domain}`),
		readTailscaleKeyExpiry(),
	]);
}
