import path from "node:path";

import { NasToolEnum } from "@citadel/specs/src/projects/backlog/enum/nasTool.enum.ts";
import type { SurveyedShow } from "@citadel/specs/src/projects/backlog/mediaState/surveyedShow.type.ts";
import type { UnlinkedMedia } from "@citadel/specs/src/projects/backlog/mediaState/unlinkedMedia.type.ts";
import type { ReportDuplicate } from "@citadel/specs/src/projects/backlog/mediaSyncReport/reportDuplicate.type.ts";

import type { ArrQueue } from "../client/arrQueue.type.ts";
import type { SonarrSeriesDetails } from "../client/sonarrSeriesDetails.type.ts";
import type { DiskFile } from "../disk/diskFile.type.ts";
import { parseEpisodeNumbers } from "../disk/parseEpisodeNumbers.ts";
import { parseFolderName } from "../disk/parseFolderName.ts";
import { readJellyfinTmdbId } from "../jellyfin/readJellyfinTmdbId.ts";
import { buildNasEntry } from "./buildNasEntry.ts";
import { describeDuplicate } from "./describeDuplicate.ts";
import { distinctByInode } from "./distinctByInode.ts";
import type { EpisodeDraft } from "./episodeDraft.type.ts";
import type { FolderGroup } from "./folderGroup.type.ts";
import { groupVideoFolders } from "./groupVideoFolders.ts";
import type { LinkContext } from "./linkContext.type.ts";
import { sameEpisodeFiles } from "./sameEpisodeFiles.ts";
import type { ShowDraft } from "./showDraft.type.ts";

// La saison 0 réunit les spéciaux, que Sonarr numérote autrement que TMDB : pas de relevé (§5)
const SPECIALS_SEASON_NUMBER = 0;

function episodeKey(seasonNumber: number, episodeNumber: number): string {
	return `${seasonNumber}:${episodeNumber}`;
}

// L'élément Jellyfin de la série, d'après le premier épisode dont Jellyfin a le fichier
function findJellyfinSeries(context: LinkContext, files: readonly DiskFile[]) {
	for (const file of files) {
		const seriesId = context.jellyfin.byInode.get(file.inode)?.SeriesId;
		const series =
			seriesId === null || seriesId === undefined
				? undefined
				: context.jellyfin.seriesById.get(seriesId);
		if (series !== undefined) return series;
	}
	return null;
}

function draftSonarrShow(
	context: LinkContext,
	{ series, episodes, files }: SonarrSeriesDetails,
	downloadByEpisodeId: ReadonlyMap<number, string>,
): ShowDraft {
	const filesById = new Map(files.map((file) => [file.id, file]));
	const drafts = new Map<string, EpisodeDraft>();
	for (const episode of episodes) {
		if (
			episode.seasonNumber === SPECIALS_SEASON_NUMBER ||
			episode.episodeNumber <= 0
		)
			continue;
		const sonarrFile =
			episode.episodeFileId === null || episode.episodeFileId === undefined
				? undefined
				: filesById.get(episode.episodeFileId);
		const mainFile =
			sonarrFile === undefined
				? undefined
				: context.disk.byPath.get(sonarrFile.path);
		drafts.set(episodeKey(episode.seasonNumber, episode.episodeNumber), {
			seasonNumber: episode.seasonNumber,
			episodeNumber: episode.episodeNumber,
			mainFile: mainFile ?? null,
			mediaInfo:
				mainFile === undefined ? null : (sonarrFile?.mediaInfo ?? null),
			files:
				mainFile === undefined
					? []
					: sameEpisodeFiles(
							context,
							mainFile,
							episode.seasonNumber,
							episode.episodeNumber,
						),
			trackedBy: NasToolEnum.SONARR,
			downloadHash: downloadByEpisodeId.get(episode.id) ?? null,
		});
	}
	const jellyfinSeries = findJellyfinSeries(
		context,
		[...drafts.values()].flatMap(({ mainFile }) =>
			mainFile === null ? [] : [mainFile],
		),
	);
	const folderPath = series.path.replace(/\/+$/, "");
	return {
		toolTmdbId:
			typeof series.tmdbId === "number" && series.tmdbId > 0
				? series.tmdbId
				: null,
		jellyfinTmdbId: readJellyfinTmdbId(jellyfinSeries),
		jellyfinSeriesId: jellyfinSeries?.Id ?? null,
		folder: {
			path: folderPath,
			...parseFolderName(path.posix.basename(folderPath)),
		},
		title: series.title,
		year: series.year ?? null,
		episodes: drafts,
	};
}

// Les numéros d'un fichier hors de Sonarr : ceux que Jellyfin lui donne, sinon ceux de son nom
function numbersOf(context: LinkContext, file: DiskFile) {
	const item = context.jellyfin.byInode.get(file.inode);
	if (
		typeof item?.ParentIndexNumber === "number" &&
		typeof item.IndexNumber === "number"
	)
		return {
			seasonNumber: item.ParentIndexNumber,
			episodeNumber: item.IndexNumber,
		};
	return parseEpisodeNumbers(path.posix.basename(file.path));
}

// Un fichier d'épisode qu'aucun outil ne suit : un fichier de plus pour l'épisode, ou un nouvel épisode
function addOrphanFile(
	context: LinkContext,
	show: ShowDraft,
	file: DiskFile,
): void {
	const numbers = numbersOf(context, file);
	if (
		numbers === null ||
		numbers.seasonNumber <= SPECIALS_SEASON_NUMBER ||
		numbers.episodeNumber <= 0
	)
		return;
	const key = episodeKey(numbers.seasonNumber, numbers.episodeNumber);
	const existing = show.episodes.get(key);
	if (existing !== undefined && existing.mainFile !== null) {
		existing.files = distinctByInode([...existing.files, file]);
		return;
	}
	show.episodes.set(key, {
		...numbers,
		mainFile: file,
		mediaInfo: null,
		files: [file],
		trackedBy: existing?.trackedBy ?? null,
		downloadHash: existing?.downloadHash ?? null,
	});
}

function unlinkedFolder(
	context: LinkContext,
	group: FolderGroup,
): UnlinkedMedia {
	return {
		path: group.path,
		trackedBy: null,
		fileCount: group.files.length,
		sizeBytes: group.files.reduce(
			(total, { sizeBytes }) => total + sizeBytes,
			0,
		),
		isInJellyfin: group.files.some((file) =>
			context.jellyfin.byInode.has(file.inode),
		),
		torrentCount: new Set(
			group.files.flatMap((file) =>
				(context.torrentsByInode.get(file.inode) ?? []).map(({ hash }) => hash),
			),
		).size,
	};
}

/**
 * Les dossiers de series/ que Sonarr ne suit pas, ou les fichiers qu'il ne connaît pas : rangés sous la série que
 * Jellyfin leur donne. Une série que Jellyfin ne relie à aucun identifiant ne se liste que par son chemin
 */
function addOrphanFolders(
	context: LinkContext,
	shows: ShowDraft[],
	groups: Map<string, FolderGroup>,
): UnlinkedMedia[] {
	const unlinked: UnlinkedMedia[] = [];
	for (const group of groups.values()) {
		const jellyfinSeries = findJellyfinSeries(context, group.files);
		const jellyfinTmdbId = readJellyfinTmdbId(jellyfinSeries);
		// Un fichier que Sonarr ne connaît pas, dans le dossier d'une de ses séries, est de cette série
		let show = shows.find((draft) => draft.folder?.path === group.path);
		if (show !== undefined) {
			for (const file of group.files) addOrphanFile(context, show, file);
			continue;
		}
		if (jellyfinTmdbId === null) {
			unlinked.push(unlinkedFolder(context, group));
			continue;
		}
		show = shows.find(
			(draft) => (draft.toolTmdbId ?? draft.jellyfinTmdbId) === jellyfinTmdbId,
		);
		if (show === undefined) {
			show = {
				toolTmdbId: null,
				jellyfinTmdbId,
				jellyfinSeriesId: jellyfinSeries?.Id ?? null,
				folder: { path: group.path, title: group.title, year: group.year },
				title: jellyfinSeries?.Name ?? group.title,
				year: jellyfinSeries?.ProductionYear ?? group.year,
				episodes: new Map(),
			};
			shows.push(show);
		}
		for (const file of group.files) addOrphanFile(context, show, file);
	}
	return unlinked;
}

function toSurveyedShow(
	context: LinkContext,
	draft: ShowDraft,
): SurveyedShow | null {
	const tmdbId = draft.toolTmdbId ?? draft.jellyfinTmdbId;
	if (tmdbId === null) return null;
	return {
		tmdbId,
		toolTmdbId: draft.toolTmdbId,
		jellyfinTmdbId: draft.jellyfinTmdbId,
		folder: draft.folder,
		title: draft.title,
		year: draft.year,
		jellyfinItemId: draft.jellyfinSeriesId,
		jellyfinCollection:
			draft.jellyfinSeriesId === null
				? null
				: (context.jellyfin.collectionByItemId.get(draft.jellyfinSeriesId) ??
					null),
		episodes: [...draft.episodes.values()]
			.toSorted(
				(first, second) =>
					first.seasonNumber - second.seasonNumber ||
					first.episodeNumber - second.episodeNumber,
			)
			.map((episode) => ({
				seasonNumber: episode.seasonNumber,
				episodeNumber: episode.episodeNumber,
				entry: buildNasEntry(context, episode).entry,
			})),
	};
}

function pad(number: number): string {
	return String(number).padStart(2, "0");
}

/**
 * Les séries du NAS (§8, étape 3) : celles de Sonarr et leurs épisodes, puis les fichiers de series/ qu'il ne suit pas.
 * Comme pour les films, chaque source garde son identifiant ; une série de Sonarr sans identifiant TMDB, que Jellyfin
 * ne relie à rien non plus, ne se liste que par son chemin
 */
export function surveyShows(
	context: LinkContext,
	seriesDetails: readonly SonarrSeriesDetails[],
	queue: ArrQueue,
): {
	shows: SurveyedShow[];
	unlinked: UnlinkedMedia[];
	duplicates: ReportDuplicate[];
} {
	const downloadByEpisodeId = new Map(
		queue.records.flatMap(({ episodeId, downloadId }) =>
			episodeId === null ||
			episodeId === undefined ||
			downloadId === null ||
			downloadId === undefined
				? []
				: [[episodeId, downloadId.toLowerCase()] as const],
		),
	);
	const drafts = seriesDetails.map((details) =>
		draftSonarrShow(context, details, downloadByEpisodeId),
	);
	const usedInodes = new Set(
		drafts.flatMap((draft) =>
			[...draft.episodes.values()].flatMap(({ files }) =>
				files.map(({ inode }) => inode),
			),
		),
	);
	const groups = groupVideoFolders(
		context,
		[context.roots.series],
		(inode) => !usedInodes.has(inode),
	);
	const unlinked = addOrphanFolders(context, drafts, groups);
	const shows: SurveyedShow[] = [];
	for (const draft of drafts) {
		const show = toSurveyedShow(context, draft);
		if (show !== null) shows.push(show);
		else if (draft.folder !== null)
			unlinked.push({
				...unlinkedFolder(context, {
					...draft.folder,
					files: distinctByInode(
						[...draft.episodes.values()].flatMap(({ files }) => files),
					),
				}),
				trackedBy: NasToolEnum.SONARR,
			});
	}
	return {
		shows,
		unlinked,
		duplicates: drafts.flatMap((draft) =>
			[...draft.episodes.values()]
				.filter(({ files }) => files.length > 1)
				.map((episode) =>
					describeDuplicate(
						context,
						`${draft.title ?? draft.folder?.title ?? "?"} S${pad(episode.seasonNumber)}E${pad(episode.episodeNumber)}`,
						episode.files,
					),
				),
		),
	};
}
