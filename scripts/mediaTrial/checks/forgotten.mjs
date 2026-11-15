// Vérification 4 : les médias oubliés (sur le disque, dans les outils ou dans qBittorrent sans être dans la liste),
// une ligne par média (§5) ; les torrents sans média, les doublons et les médias sans torrent.
import { folders, libraryFolderOf, toHostPath, topFolder } from "../lib/fileList.mjs";
import { tmdbIdOf } from "../lib/nasIndex.mjs";
import { gigabytes, isVideoFile, join, round } from "../lib/text.mjs";

const libraryRoots = [folders.movies, folders.moviesArchives, folders.series];

function createForgottenMedia() {
	const byFolder = new Map();
	return {
		entry(folder, title) {
			if (!byFolder.has(folder)) byFolder.set(folder, { folder, title, types: new Set(), tmdbIds: new Set(), places: new Set(), files: 0, bytes: 0, torrents: 0 });
			return byFolder.get(folder);
		},
		all: () => [...byFolder.values()],
	};
}

// Un média relié à la liste par son fichier n'est jamais oublié, même si l'outil lui donne un autre identifiant (§5)
function addToolMedia(media, { radarr, sonarr, jellyfin }, isLinked, listMovieIds, listSeriesIds) {
	const add = (place, type, tmdbId, title, containerPath) => {
		const folder = libraryFolderOf(toHostPath(containerPath));
		if (!folder) return;
		const entry = media.entry(folder, title);
		entry.places.add(place);
		entry.types.add(type);
		if (tmdbId) entry.tmdbIds.add(tmdbId);
	};
	for (const movie of radarr.movies) {
		if (listMovieIds.has(movie.tmdbId) || isLinked(movie.movieFile?.path)) continue;
		add(movie.hasFile ? "Radarr" : "Radarr (sans fichier)", "Film", movie.tmdbId, `${movie.title} (${movie.year})`, movie.path);
	}
	for (const { series, files } of sonarr.details) {
		if (listSeriesIds.has(series.tmdbId) || files.some((file) => isLinked(file.path))) continue;
		add("Sonarr", "Série", series.tmdbId, series.title, series.path);
	}
	for (const movie of jellyfin.movies) {
		if (listMovieIds.has(tmdbIdOf(movie)) || isLinked(movie.Path)) continue;
		add("Jellyfin", "Film", tmdbIdOf(movie), movie.Name, movie.Path);
	}
	for (const series of jellyfin.series) {
		if (listSeriesIds.has(tmdbIdOf(series))) continue;
		add("Jellyfin", "Série", tmdbIdOf(series), series.Name, series.Path);
	}
}

function addUnlinkedFiles(media, fileList, usedInodes) {
	for (const root of libraryRoots) {
		for (const file of fileList.under(root).filter((entry) => isVideoFile(entry.path) && !usedInodes.has(entry.inode))) {
			const folder = libraryFolderOf(file.path);
			const entry = media.entry(folder, topFolder(file.path, root));
			entry.places.add("Disque");
			entry.files++;
			entry.bytes += file.size;
		}
	}
}

// Un torrent non relié à la liste : rangé avec son média s'il a un fichier dans une bibliothèque, sinon « sans média »
function addUnlinkedTorrents(media, torrents, linkedHashes, fileList) {
	const withoutMedia = [];
	for (const torrent of torrents.filter((item) => !item.isOther && !linkedHashes.has(item.hash))) {
		const libraryPath = torrent.inodes.flatMap((inode) => fileList.pathsByInode.get(inode) ?? []).find((path) => libraryFolderOf(path));
		if (!libraryPath) {
			withoutMedia.push(torrent);
			continue;
		}
		const entry = media.entry(libraryFolderOf(libraryPath), torrent.name);
		entry.places.add("qBittorrent");
		entry.torrents++;
	}
	return withoutMedia;
}

function forgottenRow(entry) {
	return {
		title: entry.title,
		type: join([...entry.types]),
		tmdbId: join([...entry.tmdbIds]),
		places: join([...entry.places], " · "),
		disk: entry.files ? `${entry.files} fichiers, ${gigabytes(entry.bytes)} Go` : undefined,
		torrents: entry.torrents || undefined,
		folder: entry.folder,
	};
}

export function runForgotten({ report, index, nas, listMovieIds, listSeriesIds, linking }) {
	const { results, usedInodes, linkedHashes } = linking;
	const isLinked = (containerPath) => usedInodes.has(index.fileList.get(toHostPath(containerPath))?.inode);
	const media = createForgottenMedia();
	addToolMedia(media, nas, isLinked, listMovieIds, listSeriesIds);
	addUnlinkedFiles(media, index.fileList, usedInodes);
	const withoutMedia = addUnlinkedTorrents(media, index.torrents.torrents, linkedHashes, index.fileList);

	report.addSheet(
		"4 Oubliés",
		[
			{ key: "title", header: "Titre ou dossier", width: 45 },
			{ key: "type", header: "Type" },
			{ key: "tmdbId", header: "TMDB (d'après les outils)" },
			{ key: "places", header: "Où", width: 40 },
			{ key: "disk", header: "Disque, non relié", width: 25 },
			{ key: "torrents", header: "Torrents" },
			{ key: "folder", header: "Dossier", width: 60 },
		],
		media.all().map(forgottenRow),
	);

	report.addSheet(
		"4 Torrents sans média",
		[
			{ key: "name", header: "Torrent", width: 60 },
			{ key: "category", header: "Catégorie" },
			{ key: "sizeGb", header: "Taille (Go)" },
			{ key: "progress", header: "Progression (%)" },
			{ key: "state", header: "État", width: 22 },
			{ key: "addedOn", header: "Ajouté le" },
		],
		withoutMedia.map(({ name, category, sizeGb, progress, state, addedOn }) => ({ name, category, sizeGb, progress, state, addedOn })),
	);

	report.addSheet(
		"4 Doublons",
		[
			{ key: "media", header: "Média", width: 45 },
			{ key: "count", header: "Fichiers distincts" },
			{ key: "files", header: "Fichiers (taille en Go)", width: 100 },
		],
		results
			.filter((result) => result.row.duplicates)
			.map((result) => ({
				media: result.row.title ?? `${result.row.series} S${result.row.season}E${result.row.episode}`,
				count: result.row.duplicates,
				files: [...new Map(result.videoFiles.map((file) => [file.inode, file])).values()].map((file) => `${file.path} (${gigabytes(file.size)})`).join(" | "),
			})),
	);

	report.addSheet(
		"4 Sans torrent",
		[
			{ key: "media", header: "Média", width: 45 },
			{ key: "path", header: "Fichier", width: 80 },
			{ key: "sizeGb", header: "Taille (Go)" },
		],
		results
			.filter((result) => result.row.onDisk === "oui" && result.row.sharing === "Non présent")
			.map((result) => ({ media: result.row.title ?? `${result.row.series} S${result.row.season}E${result.row.episode}`, path: result.row.path, sizeGb: result.row.sizeGb })),
	);

	return { forgotten: media.all().length, withoutMedia: withoutMedia.length, withoutMediaGb: round(withoutMedia.reduce((total, torrent) => total + (torrent.sizeGb ?? 0), 0), 0) };
}
