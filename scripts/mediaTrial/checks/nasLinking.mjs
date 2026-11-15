// Vérification 3 : les étapes 3 et 4 du job sur toute la liste. Une ligne par film et par épisode, avec ce qui a été
// trouvé (Radarr ou Sonarr, fichier, inode, qualité, durée, Jellyfin, collection, torrents) et ce qui n'a pas pu être relié.
import { folders, libraryFolderOf, toHostPath } from "../lib/fileList.mjs";
import { describeFile, distinctVideoInodes, jellyfinColumns, jellyfinGap, sameEpisodeFiles, storageState, tmdbIdOf } from "../lib/nasIndex.mjs";
import { join, normalizeTitle, yearOf } from "../lib/text.mjs";

const fileColumns = [
	{ key: "source", header: "Trouvé par", width: 22 },
	{ key: "storage", header: "Stockage", width: 18 },
	{ key: "path", header: "Fichier", width: 60 },
	{ key: "onDisk", header: "Sur le disque" },
	{ key: "inode", header: "Inode" },
	{ key: "links", header: "Liens physiques" },
	{ key: "sizeGb", header: "Taille (Go)" },
	{ key: "resolution", header: "Image" },
	{ key: "quality", header: "Qualité" },
	{ key: "languageTags", header: "Langues" },
	{ key: "audio", header: "Audio" },
	{ key: "subtitles", header: "Sous-titres" },
	{ key: "fileMinutes", header: "Durée du fichier (min)" },
	{ key: "tmdbMinutes", header: "Durée TMDB (min)" },
	{ key: "gbPerHour", header: "Go/h" },
	{ key: "jellyfin", header: "Jellyfin", width: 40 },
	{ key: "jellyfinCollection", header: "Collection Jellyfin", width: 25 },
	{ key: "torrents", header: "Torrents", width: 50 },
	{ key: "trackers", header: "Trackers", width: 25 },
	{ key: "sharing", header: "Partage", width: 18 },
	{ key: "gaps", header: "Écarts", width: 50 },
	{ key: "unresolved", header: "Non relié", width: 50 },
];

function unresolvedReasons(row, { inTool, toolName }) {
	return join(
		[
			inTool ? undefined : `pas dans ${toolName}`,
			inTool && !row.path ? "aucun fichier" : undefined,
			row.path && row.onDisk === "non" ? "fichier absent de la liste des fichiers" : undefined,
			row.onDisk === "oui" && !row.jellyfin ? "pas dans Jellyfin" : undefined,
			row.onDisk === "oui" && row.sharing === "Non présent" ? "aucun torrent" : undefined,
			row.onDisk === "oui" && !row.quality ? "qualité inconnue" : undefined,
			row.onDisk === "oui" && !row.fileMinutes ? "durée inconnue" : undefined,
		],
		" ; ",
	);
}

// Un film absent de Radarr peut être dans movies_archives (ou movies), sous un dossier « Titre (année) »
function findMovieFolder(index, item, tmdbMovie) {
	const year = yearOf(tmdbMovie?.release_date);
	const titles = [tmdbMovie?.title, tmdbMovie?.original_title, item.title].filter(Boolean).map(normalizeTitle);
	for (const [offset, certainty] of [[0, "sûr"], [-1, "année ±1"], [1, "année ±1"]]) {
		for (const title of titles) {
			const folder = index.movieFolders.get(`${title}:${year + offset}`);
			if (folder) return { ...folder, certainty };
		}
	}
	return undefined;
}

function largest(files) {
	return files.reduce((biggest, file) => (!biggest || file.size > biggest.size ? file : biggest), undefined);
}

function locateMovie(index, item, tmdbMovie) {
	const radarrMovie = index.radarrByTmdb.get(item.tmdbId);
	const radarrFile = radarrMovie?.movieFile;
	const folder = findMovieFolder(index, item, tmdbMovie);
	if (radarrFile) {
		const radarrFolder = toHostPath(radarrMovie.path);
		const otherFolderFiles = folder && folder.folder !== `${radarrFolder}/` ? folder.files : [];
		return {
			radarrMovie,
			source: "Radarr",
			file: {
				containerPath: radarrFile.path,
				size: radarrFile.size,
				resolution: radarrFile.mediaInfo?.resolution,
				runTime: radarrFile.mediaInfo?.runTime,
				audio: radarrFile.mediaInfo?.audioLanguages,
				subtitles: radarrFile.mediaInfo?.subtitles,
			},
			videoFiles: [...distinctVideoInodes(index.fileList, radarrFolder), ...otherFolderFiles],
		};
	}
	if (folder) {
		const where = folder.folder.startsWith(folders.moviesArchives) ? "movies_archives" : "movies";
		const folderMovie = index.radarrByFolder.get(folder.folder);
		return { radarrMovie, folderMovie, source: `${where} (dossier, ${folder.certainty})`, file: { containerPath: largest(folder.files).path }, videoFiles: folder.files };
	}
	return { radarrMovie, source: radarrMovie ? "Radarr, sans fichier" : undefined, file: {}, videoFiles: [] };
}

// Un fichier trouvé par son dossier qu'aucun outil ne suit ; ou un dossier du film (principal, ou celui d'un doublon)
// que Radarr suit sous un autre identifiant
function radarrGaps(index, located, tmdbId) {
	const outsideRadarr = !located.radarrMovie?.movieFile && located.source?.includes("dossier") && !located.folderMovie;
	const movieFolders = new Set(located.videoFiles.map((file) => libraryFolderOf(file.path)).filter(Boolean));
	const otherIds = [...movieFolders].map((folder) => index.radarrByFolder.get(`${folder}/`)?.tmdbId).filter((id) => id && id !== tmdbId);
	return [outsideRadarr ? "Hors Radarr" : undefined, ...otherIds.map((id) => `Fiche Radarr différente (TMDB ${id})`)];
}

function duplicateGap(count) {
	return count > 1 ? `Doublon (${count} fichiers)` : undefined;
}

function distinctCount(files) {
	return new Set(files.map((file) => file.inode)).size;
}

function movieRow(index, item, tmdbMovie, jellyfinUrl) {
	const located = locateMovie(index, item, tmdbMovie);
	const described = describeFile(index, { ...located.file, originalLanguage: tmdbMovie?.original_language });
	const jellyfinByTmdb = index.jellyfin.moviesByTmdb.get(item.tmdbId)?.[0];
	const jellyfinItem = described.jellyfinItem ?? jellyfinByTmdb;
	const downloadHash = located.radarrMovie && index.radarrQueue.get(located.radarrMovie.id);
	const row = {
		row: item.rowNumber,
		tmdbId: item.tmdbId,
		title: tmdbMovie?.title ?? item.title,
		originalTitle: tmdbMovie?.original_title,
		group: item.group,
		collectionId: item.collectionId,
		listState: item.state,
		source: located.source,
		storage: storageState({ jellyfinItem, onDisk: described.onDisk, downloadHash, tracked: Boolean(located.radarrMovie) }, index),
		...described.row,
		tmdbMinutes: tmdbMovie?.runtime || undefined,
		...jellyfinColumns(index, jellyfinItem, jellyfinUrl),
		duplicates: distinctCount(located.videoFiles) > 1 ? distinctCount(located.videoFiles) : undefined,
	};
	row.gaps = join(
		[
			duplicateGap(row.duplicates),
			...radarrGaps(index, located, item.tmdbId),
			described.jellyfinItem ? jellyfinGap(tmdbIdOf(described.jellyfinItem), item.tmdbId) : undefined,
			tmdbMovie ? undefined : "Identifiant TMDB disparu",
		],
		" ; ",
	);
	const jellyfinNote = !described.jellyfinItem && jellyfinByTmdb ? "Jellyfin relié par TMDB, pas par le fichier" : undefined;
	row.unresolved = join([unresolvedReasons(row, { inTool: Boolean(located.radarrMovie), toolName: "Radarr" }), tmdbMovie ? undefined : "inconnu de TMDB", jellyfinNote], " ; ");
	return { row, videoFiles: located.videoFiles, mainInode: described.onDisk?.inode, downloadHash };
}

function episodeRow(index, context, numbers, tmdbEpisode, jellyfinUrl) {
	const { match, sonarrDetail } = context;
	const sonarrEpisode = sonarrDetail?.episodesByNumber.get(`${numbers.season}:${numbers.episode}`);
	const sonarrFile = sonarrEpisode?.hasFile ? sonarrDetail.filesById.get(sonarrEpisode.episodeFileId) : undefined;
	const described = describeFile(index, {
		containerPath: sonarrFile?.path,
		size: sonarrFile?.size,
		resolution: sonarrFile?.mediaInfo?.resolution,
		runTime: sonarrFile?.mediaInfo?.runTime,
		audio: sonarrFile?.mediaInfo?.audioLanguages,
		subtitles: sonarrFile?.mediaInfo?.subtitles,
		originalLanguage: match.chosen.original_language,
	});
	const downloadHash = sonarrEpisode && index.sonarrQueue.get(sonarrEpisode.id);
	const jellyfinByNumbers = index.jellyfin.episodesByKey.get(`${match.chosen.id}:${numbers.season}:${numbers.episode}`);
	const jellyfinItem = described.jellyfinItem ?? jellyfinByNumbers;
	const videoFiles = described.hostPath && described.onDisk ? sameEpisodeFiles(index.fileList, described.hostPath, numbers.season, numbers.episode) : [];
	const row = {
		series: match.chosen.name,
		tmdbId: match.chosen.id,
		matching: match.status,
		season: numbers.season === 0 ? "Épisodes spéciaux" : numbers.season,
		episode: numbers.episode,
		name: tmdbEpisode?.name ?? sonarrEpisode?.title,
		airDate: tmdbEpisode?.air_date ?? sonarrEpisode?.airDate,
		source: sonarrFile ? "Sonarr" : sonarrEpisode ? "Sonarr, sans fichier" : undefined,
		storage: storageState({ jellyfinItem, onDisk: described.onDisk, downloadHash, tracked: Boolean(sonarrEpisode) }, index),
		...described.row,
		tmdbMinutes: tmdbEpisode?.runtime ?? undefined,
		...jellyfinColumns(index, jellyfinItem, jellyfinUrl),
		duplicates: videoFiles.length > 1 ? videoFiles.length : undefined,
	};
	const jellyfinSeriesTmdb = described.jellyfinItem && index.jellyfin.seriesTmdb.get(described.jellyfinItem.SeriesId);
	row.gaps = join(
		[duplicateGap(row.duplicates), described.jellyfinItem ? jellyfinGap(jellyfinSeriesTmdb, match.chosen.id) : undefined],
		" ; ",
	);
	row.unresolved = join(
		[
			unresolvedReasons(row, { inTool: Boolean(sonarrEpisode), toolName: sonarrDetail ? "Sonarr (numérotation différente ?)" : "Sonarr" }),
			tmdbEpisode ? undefined : "pas dans TMDB (numérotation de Sonarr)",
			!described.jellyfinItem && jellyfinByNumbers ? "Jellyfin relié par les numéros, pas par le fichier" : undefined,
		],
		" ; ",
	);
	return { row, videoFiles, mainInode: described.onDisk?.inode, downloadHash };
}

function prepareSonarrDetail(detail) {
	if (!detail) return undefined;
	return {
		...detail,
		episodesByNumber: new Map(detail.episodes.map((episode) => [`${episode.seasonNumber}:${episode.episodeNumber}`, episode])),
		filesById: new Map(detail.files.map((file) => [file.id, file])),
	};
}

function seriesEpisodeRows(index, match, seasons, jellyfinUrl) {
	const context = { match, sonarrDetail: prepareSonarrDetail(index.sonarrByTmdb.get(match.chosen.id)) };
	const tmdbKeys = new Set();
	const results = [];
	for (const season of seasons) {
		for (const episode of season.episodes ?? []) {
			const numbers = { season: season.season_number, episode: episode.episode_number };
			tmdbKeys.add(`${numbers.season}:${numbers.episode}`);
			results.push(episodeRow(index, context, numbers, episode, jellyfinUrl));
		}
	}
	for (const episode of context.sonarrDetail?.episodes ?? []) {
		if (!episode.hasFile || tmdbKeys.has(`${episode.seasonNumber}:${episode.episodeNumber}`)) continue;
		results.push(episodeRow(index, context, { season: episode.seasonNumber, episode: episode.episodeNumber }, undefined, jellyfinUrl));
	}
	return results;
}

function torrentRows(torrents, linkedHashes) {
	return torrents.map((torrent) => ({
		name: torrent.name,
		category: torrent.category,
		tags: torrent.tags,
		addedOn: torrent.addedOn,
		progress: torrent.progress,
		sizeGb: torrent.sizeGb,
		trackers: torrent.hosts.join(" | "),
		tiers: torrent.tiers,
		state: torrent.isOther ? `${torrent.state} (autre, ignoré)` : torrent.state,
		messages: torrent.messages.join(" | ") || undefined,
		linked: torrent.isOther ? undefined : linkedHashes.has(torrent.hash) ? "oui" : "non",
		missingFiles: torrent.missingFromFileList || undefined,
	}));
}

function trackerSummaryRows(torrents) {
	const byHost = new Map();
	for (const torrent of torrents.filter((item) => !item.isOther)) {
		for (const host of torrent.hosts.length ? torrent.hosts : ["(aucun)"]) {
			if (!byHost.has(host)) byHost.set(host, { host, total: 0 });
			const summary = byHost.get(host);
			summary.total++;
			summary[torrent.state] = (summary[torrent.state] ?? 0) + 1;
		}
	}
	return [...byHost.values()];
}

export async function runNasLinking({ tmdb, report, index, movies, seriesMatches, jellyfinUrl }) {
	const tmdbMovies = await report.time(
		"3. TMDB : fiches des films de la liste",
		() => tmdb.mapAll(movies, (movie) => (movie.tmdbId ? tmdb.movieSummary(movie.tmdbId).catch(() => undefined) : undefined)),
		(results) => `${results.filter(Boolean).length} / ${movies.length} films trouvés`,
	);
	const matchedSeries = seriesMatches.filter((match) => match.chosen);
	const seriesSeasons = await report.time(
		"3. TMDB : saisons et épisodes des séries de la liste",
		() => tmdb.mapAll(matchedSeries, async (match) => tmdb.allSeasons(await tmdb.tv(match.chosen.id))),
		(results) => `${results.flat().length} saisons`,
	);

	const { movieResults, episodeResults } = await report.time(
		"3. Rapprochement des fichiers, de Jellyfin et des torrents",
		() => ({
			movieResults: movies.map((movie, position) => movieRow(index, movie, tmdbMovies[position], jellyfinUrl)),
			episodeResults: matchedSeries.flatMap((match, position) => seriesEpisodeRows(index, match, seriesSeasons[position], jellyfinUrl)),
		}),
		({ movieResults, episodeResults }) => `${movieResults.length} films, ${episodeResults.length} épisodes`,
	);

	report.addSheet(
		"3 Films",
		[
			{ key: "row", header: "Ligne" },
			{ key: "tmdbId", header: "TMDB" },
			{ key: "title", header: "Titre", width: 35 },
			{ key: "originalTitle", header: "Titre original", width: 30 },
			{ key: "group", header: "Groupe (liste)", width: 20 },
			{ key: "collectionId", header: "Collection (liste)" },
			{ key: "listState", header: "État (liste)" },
			...fileColumns,
		],
		movieResults.map((result) => result.row),
	);
	report.addSheet(
		"3 Épisodes",
		[
			{ key: "series", header: "Série", width: 30 },
			{ key: "tmdbId", header: "TMDB" },
			{ key: "matching", header: "Rapprochement" },
			{ key: "season", header: "Saison", width: 18 },
			{ key: "episode", header: "Épisode" },
			{ key: "name", header: "Titre", width: 30 },
			{ key: "airDate", header: "Diffusion" },
			...fileColumns,
		],
		episodeResults.map((result) => result.row),
	);

	const results = [...movieResults, ...episodeResults];
	const usedInodes = new Set(results.flatMap((result) => result.videoFiles.map((file) => file.inode)));
	for (const result of results) if (result.mainInode) usedInodes.add(result.mainInode);
	// Un torrent est relié à la liste par ses fichiers, ou, s'il se télécharge encore, par la file de Radarr ou de Sonarr
	const linkedHashes = new Set([
		...[...usedInodes].flatMap((inode) => (index.torrents.byInode.get(inode) ?? []).map((torrent) => torrent.hash)),
		...results.map((result) => result.downloadHash).filter(Boolean),
	]);

	report.addSheet(
		"3 Torrents",
		[
			{ key: "name", header: "Torrent", width: 60 },
			{ key: "category", header: "Catégorie" },
			{ key: "tags", header: "Étiquettes", width: 20 },
			{ key: "addedOn", header: "Ajouté le" },
			{ key: "progress", header: "Progression (%)" },
			{ key: "sizeGb", header: "Taille (Go)" },
			{ key: "trackers", header: "Trackers", width: 25 },
			{ key: "tiers", header: "Paliers", width: 35 },
			{ key: "state", header: "État", width: 22 },
			{ key: "messages", header: "Message du tracker", width: 40 },
			{ key: "linked", header: "Relié à la liste" },
			{ key: "missingFiles", header: "Fichiers absents de la liste des fichiers" },
		],
		torrentRows(index.torrents.torrents, linkedHashes),
	);
	const summaries = trackerSummaryRows(index.torrents.torrents);
	const states = [...new Set(summaries.flatMap((summary) => Object.keys(summary)).filter((key) => !["host", "total"].includes(key)))];
	report.addSheet(
		"3 Trackers",
		[{ key: "host", header: "Tracker", width: 30 }, { key: "total", header: "Torrents" }, ...states.map((state) => ({ key: state, header: state }))],
		summaries,
	);

	return { results, usedInodes, linkedHashes };
}
