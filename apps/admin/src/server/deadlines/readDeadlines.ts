import type { DeadlineItem } from "../../shared/deadlineItem.type.ts";
import { env } from "../configuration/env.ts";
import { readStateJson } from "../state/readStateJson.ts";
import { readTailscaleStateFile } from "../tailscale/readTailscaleStateFile.ts";
import { readCertificateExpiry } from "./readCertificateExpiry.ts";

// La clé du NAS dans ton tailnet : sans expiration. Une date ici veut dire
// que le réglage a sauté, et que le NAS sortira du tailnet ce jour-là.
async function readTailscaleKeyExpiry(): Promise<DeadlineItem> {
	const label = "Clé Tailscale du NAS";
	const state = await readTailscaleStateFile();
	if (!state) return { label, expiresAt: null, problem: "aucun relevé" };
	return { label, expiresAt: state.selfKeyExpiry, problem: null };
}

type DriveFile = { checkedAt: string; totalBytes: number; usedBytes: number };

// Le quota du Drive, relevé chaque nuit par update-check : plein, plus de sauvegarde
// hors site
async function readDriveQuota(): Promise<DeadlineItem> {
	const label = "Quota du Drive";
	const drive = await readStateJson<DriveFile>("drive.json");
	if (!drive)
		return {
			label,
			expiresAt: null,
			problem: "aucun relevé (job update-check)",
		};
	return {
		label,
		expiresAt: null,
		problem: null,
		usage: { usedBytes: drive.usedBytes, totalBytes: drive.totalBytes },
	};
}

export function readDeadlines(): Promise<DeadlineItem[]> {
	const domain = env.SITE_DOMAIN;
	return Promise.all([
		readCertificateExpiry(domain),
		readCertificateExpiry(`www.${domain}`),
		readCertificateExpiry(`jellyfin.${domain}`),
		readTailscaleKeyExpiry(),
		readDriveQuota(),
	]);
}
