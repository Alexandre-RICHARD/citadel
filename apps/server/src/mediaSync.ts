import "./configuration/timezone.ts";

import { createMediaSyncClients } from "./projects/backlog/mediaSync/run/createMediaSyncClients.ts";
import { describeReportSummary } from "./projects/backlog/mediaSync/run/describeReportSummary.ts";
import { runMediaSync } from "./projects/backlog/mediaSync/run/runMediaSync.ts";
import { readMediaSyncSettings } from "./projects/backlog/mediaSync/settings/readMediaSyncSettings.ts";

/* eslint-disable no-console -- une commande : sa sortie est son compte rendu, lu dans le log du job */

/**
 * Le job media-sync (docs/backlog/backlog_media.md, §8), lancé chaque nuit par infra-ops dans un conteneur jetable de
 * l'image du serveur : `node build/mediaSync.cjs`. Il lit le disque des médias (en lecture seule), Radarr, Sonarr,
 * Jellyfin et qBittorrent, et n'écrit que le relevé (media-state/survey), le rapport (state/media-sync) et l'étiquette
 * tracker-invalide. Aucun accès à la base du site
 */
async function mediaSync(): Promise<void> {
	const settings = readMediaSyncSettings(process.env);
	const report = await runMediaSync(settings, createMediaSyncClients(settings));
	console.log(describeReportSummary(report));
}

mediaSync().catch((error: unknown) => {
	console.error(
		"Échec du job media-sync :",
		error instanceof Error ? error.message : String(error),
	);
	process.exit(1);
});
