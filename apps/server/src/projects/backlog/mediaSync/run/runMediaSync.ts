import { mkdir } from "node:fs/promises";
import path from "node:path";

import { MEDIA_STATE_FORMAT_VERSION } from "@citadel/specs/src/projects/backlog/mediaState/mediaStateFormatVersion.ts";
import type { MediaSurvey } from "@citadel/specs/src/projects/backlog/mediaState/mediaSurvey.type.ts";
import type { MediaSyncReport } from "@citadel/specs/src/projects/backlog/mediaSyncReport/mediaSyncReport.type.ts";
import { MEDIA_SYNC_REPORT_FILE } from "@citadel/specs/src/projects/backlog/mediaSyncReport/mediaSyncReportFile.ts";
import { mediaSyncReportSchema } from "@citadel/specs/src/projects/backlog/mediaSyncReport/mediaSyncReportSchema.ts";

import { buildDiskIndex } from "../disk/buildDiskIndex.ts";
import { buildLibraryRoots } from "../disk/buildLibraryRoots.ts";
import { scanDataDir } from "../disk/scanDataDir.ts";
import { indexJellyfin } from "../jellyfin/indexJellyfin.ts";
import { buildLinkContext } from "../link/buildLinkContext.ts";
import { surveyMovies } from "../link/surveyMovies.ts";
import { surveyShows } from "../link/surveyShows.ts";
import { buildMediaSyncReport } from "../report/buildMediaSyncReport.ts";
import type { MediaSyncSettings } from "../settings/mediaSyncSettings.type.ts";
import { readPreviousReport } from "../state/readPreviousReport.ts";
import { writeJsonAtomically } from "../state/writeJsonAtomically.ts";
import { writeSurvey } from "../state/writeSurvey.ts";
import { createTrackerNamer } from "../torrent/createTrackerNamer.ts";
import { INVALID_TRACKER_TAG } from "../torrent/invalidTrackerTag.ts";
import { planTagChanges } from "../torrent/planTagChanges.ts";
import { surveyTorrents } from "../torrent/surveyTorrents.ts";
import type { MediaSyncClients } from "./mediaSyncClients.type.ts";

/**
 * Un passage du job media-sync (§8, étapes 2 à 5), une fois les services démarrés par infra-ops : tout lire (outils,
 * qBittorrent, disque), classer les torrents et poser ou retirer l'étiquette tracker-invalide, relier chaque fichier,
 * puis écrire le relevé dans media-state et le rapport dans state/. Ne lit jamais la base du site
 */
export async function runMediaSync(
	settings: MediaSyncSettings,
	clients: MediaSyncClients,
	now: () => Date = () => new Date(),
): Promise<MediaSyncReport> {
	const startedAt = now().toISOString();
	const roots = buildLibraryRoots(settings.dataDir);
	const [
		diskFiles,
		radarrMovies,
		radarrQueue,
		sonarrDetails,
		sonarrQueue,
		library,
		entries,
	] = await Promise.all([
		scanDataDir(settings.dataDir),
		clients.radarr.movies(),
		clients.radarr.queue(),
		clients.sonarr.seriesDetails(),
		clients.sonarr.queue(),
		clients.jellyfin.library(),
		clients.qbittorrent.entries(),
	]);
	const disk = buildDiskIndex(diskFiles);

	const torrents = surveyTorrents(
		entries,
		createTrackerNamer(settings.trackers),
		disk,
		roots.otherTorrents,
	);
	const tagChanges = planTagChanges(torrents);
	await clients.qbittorrent.addTag(tagChanges.toAdd, INVALID_TRACKER_TAG);
	await clients.qbittorrent.removeTag(tagChanges.toRemove, INVALID_TRACKER_TAG);

	const context = buildLinkContext(
		roots,
		disk,
		indexJellyfin(library, disk),
		torrents,
	);
	const movies = surveyMovies(context, radarrMovies, radarrQueue);
	const shows = surveyShows(context, sonarrDetails, sonarrQueue);
	const survey: MediaSurvey = {
		formatVersion: MEDIA_STATE_FORMAT_VERSION,
		surveyedAt: startedAt,
		jellyfinServerId: library.serverId,
		movies: movies.movies,
		shows: shows.shows,
		unlinked: shows.unlinked,
	};
	await writeSurvey(settings.mediaStateDir, survey);

	const reportPath = path.join(
		settings.citadelStateDir,
		MEDIA_SYNC_REPORT_FILE,
	);
	const report = buildMediaSyncReport({
		startedAt,
		finishedAt: now().toISOString(),
		crossSeedSearch: settings.crossSeedSearch,
		torrents,
		disk,
		mediasRoot: roots.medias,
		queuedHashes: new Set(
			[...radarrQueue.records, ...sonarrQueue.records].flatMap(
				({ downloadId }) =>
					downloadId === null || downloadId === undefined
						? []
						: [downloadId.toLowerCase()],
			),
		),
		survey,
		duplicates: [...movies.duplicates, ...shows.duplicates],
		tags: {
			added: tagChanges.toAdd.length,
			removed: tagChanges.toRemove.length,
		},
		previous: await readPreviousReport(reportPath),
	});
	await mkdir(path.dirname(reportPath), { recursive: true });
	await writeJsonAtomically(reportPath, mediaSyncReportSchema.parse(report));
	return report;
}
