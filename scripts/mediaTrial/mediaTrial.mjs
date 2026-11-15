// Scripts d'essai du backlog des médias (docs/backlog/backlog_media.md §9), lancés depuis le PC par scripts/mediaTrial.sh.
// Lecture seule partout : rien n'est écrit sur le NAS, dans les outils ni dans la base du site. Supprimés quand le job existe.
import { createRadarrClient, createSonarrClient } from "./clients/arr.mjs";
import { createJellyfinClient } from "./clients/jellyfin.mjs";
import { createQbittorrentClient } from "./clients/qbittorrent.mjs";
import { createTmdbClient } from "./clients/tmdb.mjs";
import { runForgotten } from "./checks/forgotten.mjs";
import { runNasLinking } from "./checks/nasLinking.mjs";
import { runSeriesMatching } from "./checks/seriesMatching.mjs";
import { runTmdbCheck } from "./checks/tmdbCheck.mjs";
import { readConfig, requireNasHost } from "./lib/config.mjs";
import { readFileList } from "./lib/fileList.mjs";
import { readMediaList, readShortList } from "./lib/inputs.mjs";
import { buildNasIndex } from "./lib/nasIndex.mjs";
import { indexTorrents } from "./lib/torrents.mjs";
import { createReport } from "./lib/report.mjs";

async function readNas(report, config) {
	const nasHost = requireNasHost(config);
	const radarr = createRadarrClient(nasHost);
	const sonarr = createSonarrClient(nasHost);
	const jellyfin = createJellyfinClient(nasHost);
	const qbittorrent = createQbittorrentClient(nasHost);

	const fileList = await report.time("Lecture de la liste des fichiers", () => readFileList(config.fileListFile), (list) => `${list.byPath.size} fichiers`);
	const radarrData = await report.time(
		"Radarr : films et file d'attente",
		async () => ({ movies: await radarr.movies(), queue: await radarr.queue() }),
		(data) => `${data.movies.length} films`,
	);
	const sonarrData = await report.time(
		"Sonarr : séries, épisodes, fichiers et file d'attente",
		async () => {
			const series = await sonarr.series();
			return { series, details: await sonarr.episodesAndFiles(series), queue: await sonarr.queue() };
		},
		(data) => `${data.series.length} séries`,
	);
	const jellyfinData = await report.time(
		"Jellyfin : films, séries, épisodes et collections",
		() => jellyfin.library(),
		(data) => `${data.movies.length} films, ${data.episodes.length} épisodes, ${data.collectionChildren.length} collections`,
	);
	const torrentEntries = await report.time(
		"qBittorrent : torrents, fichiers et trackers",
		() => qbittorrent.torrentsWithFilesAndTrackers(),
		(entries) => `${entries.length} torrents`,
	);
	const torrents = indexTorrents(torrentEntries, fileList);
	return { radarr: radarrData, sonarr: sonarrData, jellyfin: jellyfinData, torrents, fileList, jellyfinUrl: jellyfin.itemUrl };
}

function addColumnsSheet(report, mediaList) {
	report.addSheet(
		"0 Colonnes lues",
		[
			{ key: "sheet", header: "Feuille", width: 20 },
			{ key: "name", header: "Donnée" },
			{ key: "title", header: "Colonne reconnue", width: 30 },
			{ key: "columnNumber", header: "N° de colonne" },
		],
		mediaList.columns,
	);
}

async function runListChecks(report, tmdb, config) {
	const mediaList = await report.time("Lecture de la liste", () => readMediaList(config.mediaListFile), (list) => `${list.movies.length} films, ${list.series.length} séries`);
	addColumnsSheet(report, mediaList);

	if (!config.fileListFile) {
		console.log("Pas de --files : vérifications 3 et 4 sautées, et la 2 se fait sans Sonarr");
		await runSeriesMatching({ tmdb, report, series: mediaList.series });
		return;
	}

	const nas = await readNas(report, config);
	const seriesMatches = await runSeriesMatching({ tmdb, report, series: mediaList.series, sonarrSeries: nas.sonarr.series });
	const index = buildNasIndex(nas);
	const linking = await runNasLinking({ tmdb, report, index, movies: mediaList.movies, seriesMatches, jellyfinUrl: nas.jellyfinUrl });
	const listMovieIds = new Set(mediaList.movies.map((movie) => movie.tmdbId).filter(Boolean));
	const listSeriesIds = new Set(seriesMatches.map((match) => match.chosen?.id).filter(Boolean));
	await report.time(
		"4. Oubliés, torrents sans média, doublons et sans torrent",
		() => runForgotten({ report, index, nas, listMovieIds, listSeriesIds, linking }),
		(result) => `${result.forgotten} médias oubliés, ${result.withoutMedia} torrents sans média (${result.withoutMediaGb} Go)`,
	);
}

async function main() {
	const config = readConfig(process.argv.slice(2));
	const report = createReport();
	const tmdb = createTmdbClient();
	if (config.shortListFile) await runTmdbCheck({ tmdb, report, shortList: readShortList(config.shortListFile) });
	if (config.mediaListFile) await runListChecks(report, tmdb, config);
	await report.write(config.output);
	console.log(`Rapport écrit : ${config.output}`);
}

main().catch((error) => {
	console.error(`Échec : ${error.message}`);
	process.exit(1);
});
