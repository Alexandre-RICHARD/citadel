// Tout ce qui a été lu sur le NAS, indexé pour relier un film ou un épisode à son fichier, à Jellyfin et à ses torrents.
import { folders, parentFolder, toHostPath, topFolder } from "./fileList.mjs";
import { gigabytes, languageCodesOf, languageTags, isVideoFile, normalizeTitle, parseEpisodeNumbers, parseRunTimeMinutes, parseTitleYearFolder, qualityFromResolution, round } from "./text.mjs";
import { bestSharingState } from "./torrents.mjs";

const ticksPerMinute = 600_000_000;

function groupBy(items, keyOf) {
	const groups = new Map();
	for (const item of items) {
		const key = keyOf(item);
		if (key === undefined) continue;
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key).push(item);
	}
	return groups;
}

function indexJellyfin(library, fileList) {
	const all = [...library.movies, ...library.episodes];
	const collectionsByItem = new Map();
	for (const { collection, children } of library.collectionChildren) {
		for (const child of children) collectionsByItem.set(child.Id, [...(collectionsByItem.get(child.Id) ?? []), collection.Name]);
	}
	const seriesTmdb = new Map(library.series.map((series) => [series.Id, tmdbIdOf(series)]));
	return {
		library,
		seriesTmdb,
		collectionsByItem,
		byInode: new Map(all.map((item) => [fileList.get(toHostPath(item.Path))?.inode, item]).filter(([inode]) => inode)),
		moviesByTmdb: groupBy(library.movies, tmdbIdOf),
		episodesByKey: new Map(library.episodes.map((episode) => [`${seriesTmdb.get(episode.SeriesId)}:${episode.ParentIndexNumber}:${episode.IndexNumber}`, episode])),
	};
}

// Les dossiers « Titre (année) » de movies_archives, et ceux de movies, pour les films absents de Radarr
function indexMovieFolders(fileList) {
	const byKey = new Map();
	for (const root of [folders.movies, folders.moviesArchives]) {
		for (const entry of fileList.under(root).filter((file) => isVideoFile(file.path))) {
			const folder = topFolder(entry.path, root);
			const { title, year } = parseTitleYearFolder(folder);
			const key = `${normalizeTitle(title)}:${year}`;
			if (!byKey.has(key)) byKey.set(key, { folder: `${root}${folder}/`, files: [] });
			byKey.get(key).files.push(entry);
		}
	}
	return byKey;
}

export function buildNasIndex({ radarr, sonarr, jellyfin, torrents, fileList }) {
	const radarrQueue = new Map(radarr.queue.records.map((record) => [record.movieId, record.downloadId?.toLowerCase()]));
	const sonarrQueue = new Map(sonarr.queue.records.map((record) => [record.episodeId, record.downloadId?.toLowerCase()]));
	return {
		fileList,
		torrents,
		jellyfin: indexJellyfin(jellyfin, fileList),
		radarrByTmdb: new Map(radarr.movies.map((movie) => [movie.tmdbId, movie])),
		radarrByFolder: new Map(radarr.movies.map((movie) => [`${toHostPath(movie.path)}/`, movie])),
		radarrQueue,
		sonarrByTmdb: new Map(sonarr.details.map((detail) => [detail.series.tmdbId, detail])),
		sonarrQueue,
		movieFolders: indexMovieFolders(fileList),
	};
}

function jellyfinStreamLanguages(jellyfinItem, type) {
	return jellyfinItem?.MediaSources?.[0]?.MediaStreams?.filter((stream) => stream.Type === type).map((stream) => stream.Language) ?? [];
}

// Audio d'après Radarr ou Sonarr, sinon Jellyfin. Sous-titres : ceux du fichier (Radarr, Sonarr) et ceux posés à côté
// par Bazarr, que seul Jellyfin voit
function fileLanguages({ audio, subtitles }, jellyfinItem) {
	return {
		audio: languageCodesOf(audio ? [audio] : jellyfinStreamLanguages(jellyfinItem, "Audio")),
		subtitles: languageCodesOf([subtitles, ...jellyfinStreamLanguages(jellyfinItem, "Subtitle")]),
	};
}

// Ce qui ne dépend que du fichier : disque, qualité, durée, langues, Jellyfin, torrents
export function describeFile(index, { containerPath, size, resolution, runTime, audio, subtitles, originalLanguage }) {
	const hostPath = toHostPath(containerPath);
	const onDisk = hostPath ? index.fileList.get(hostPath) : undefined;
	const jellyfinItem = onDisk ? index.jellyfin.byInode.get(onDisk.inode) : undefined;
	const jellyfinVideo = jellyfinItem?.MediaSources?.[0]?.MediaStreams?.find((stream) => stream.Type === "Video");
	const quality = qualityFromResolution(resolution ?? (jellyfinVideo ? `${jellyfinVideo.Width}x${jellyfinVideo.Height}` : undefined));
	const languages = onDisk ? fileLanguages({ audio, subtitles }, jellyfinItem) : { audio: [], subtitles: [] };
	const minutes = parseRunTimeMinutes(runTime) ?? (jellyfinItem?.RunTimeTicks ? jellyfinItem.RunTimeTicks / ticksPerMinute : undefined);
	const bytes = onDisk?.size ?? size;
	const linkedTorrents = onDisk ? (index.torrents.byInode.get(onDisk.inode) ?? []) : [];
	return {
		hostPath,
		onDisk,
		jellyfinItem,
		row: {
			path: hostPath,
			onDisk: hostPath ? (onDisk ? "oui" : "non") : undefined,
			inode: onDisk?.inode,
			links: onDisk?.links,
			sizeGb: gigabytes(bytes),
			resolution: quality.width ? `${quality.width}×${quality.height}` : undefined,
			quality: quality.quality,
			languageTags: languageTags(languages.audio, languages.subtitles, originalLanguage).join(" ") || undefined,
			audio: languages.audio.join(" ") || undefined,
			subtitles: languages.subtitles.join(" ") || undefined,
			fileMinutes: round(minutes, 0),
			gbPerHour: bytes && minutes ? round(bytes / 1024 ** 3 / (minutes / 60), 2) : undefined,
			torrents: linkedTorrents.map((torrent) => torrent.name).join(" | ") || undefined,
			trackers: [...new Set(linkedTorrents.flatMap((torrent) => torrent.hosts))].join(" | ") || undefined,
			sharing: onDisk ? bestSharingState(linkedTorrents) : undefined,
		},
	};
}

// « tracked » : Radarr ou Sonarr suit le média, qu'il ait un fichier ou non
export function storageState({ jellyfinItem, onDisk, downloadHash, tracked }, index) {
	if (jellyfinItem) return "Dans Jellyfin";
	if (onDisk) return "Présent";
	const download = downloadHash && index.torrents.byHash.get(downloadHash);
	if (download && download.progress < 100) return "En téléchargement";
	return tracked ? "Attendu" : "Non suivi";
}

export function tmdbIdOf(jellyfinItem) {
	const id = Number(jellyfinItem?.ProviderIds?.Tmdb);
	return Number.isFinite(id) && id > 0 ? id : undefined;
}

// Une fiche Jellyfin reliée au fichier, mais à un autre identifiant TMDB que celui de la liste (ou à aucun)
export function jellyfinGap(jellyfinTmdbId, expectedTmdbId) {
	if (jellyfinTmdbId === expectedTmdbId) return undefined;
	return jellyfinTmdbId ? `Fiche Jellyfin différente (TMDB ${jellyfinTmdbId})` : "Fiche Jellyfin absente";
}

export function jellyfinColumns(index, jellyfinItem, jellyfinClientUrl) {
	return {
		jellyfin: jellyfinItem ? jellyfinClientUrl(jellyfinItem.Id) : undefined,
		jellyfinCollection: jellyfinItem ? index.jellyfin.collectionsByItem.get(jellyfinItem.Id)?.join(" | ") : undefined,
	};
}

// Fichiers vidéo distincts (inodes différents) d'un même dossier : un doublon, sauf s'ils sont des épisodes différents
export function distinctVideoInodes(fileList, folder, keep = () => true) {
	const files = fileList.under(folder).filter((file) => isVideoFile(file.path) && keep(file));
	return [...groupBy(files, (file) => file.inode).values()].map((group) => group[0]);
}

export function sameEpisodeFiles(fileList, mainFile, season, episode) {
	return distinctVideoInodes(fileList, parentFolder(mainFile), (file) => {
		const numbers = parseEpisodeNumbers(file.path.split("/").pop());
		return numbers?.season === season && numbers?.episode === episode;
	});
}
