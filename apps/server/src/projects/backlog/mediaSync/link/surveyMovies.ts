import path from "node:path";

import { NasToolEnum } from "@citadel/specs/src/projects/backlog/enum/nasTool.enum.ts";
import { normalizeMediaTitle } from "@citadel/specs/src/projects/backlog/helper/nas/normalizeMediaTitle.ts";
import type { SurveyedMovie } from "@citadel/specs/src/projects/backlog/mediaState/surveyedMovie.type.ts";
import type { ReportDuplicate } from "@citadel/specs/src/projects/backlog/mediaSyncReport/reportDuplicate.type.ts";

import type { ArrQueue } from "../client/arrQueue.type.ts";
import type { RadarrMovie } from "../client/radarrMovie.type.ts";
import { parseFolderName } from "../disk/parseFolderName.ts";
import { readJellyfinTmdbId } from "../jellyfin/readJellyfinTmdbId.ts";
import { buildNasEntry } from "./buildNasEntry.ts";
import { describeDuplicate } from "./describeDuplicate.ts";
import { distinctByInode } from "./distinctByInode.ts";
import type { FolderGroup } from "./folderGroup.type.ts";
import { groupVideoFolders } from "./groupVideoFolders.ts";
import { largestFile } from "./largestFile.ts";
import type { LinkContext } from "./linkContext.type.ts";
import type { MovieDraft } from "./movieDraft.type.ts";

function sameTitleAndYear(group: FolderGroup, movie: RadarrMovie): boolean {
	const radarrFolder = parseFolderName(path.posix.basename(movie.path));
	const titles = new Set(
		[movie.title, radarrFolder.title].map(normalizeMediaTitle),
	);
	const years = new Set([movie.year ?? null, radarrFolder.year]);
	return (
		titles.has(normalizeMediaTitle(group.title)) &&
		group.year !== null &&
		years.has(group.year)
	);
}

/**
 * Chaque film de Radarr, avec les fichiers de son dossier et ceux d'un autre dossier du même titre et de la même année
 * (un ancien fichier resté dans movies_archives, par exemple) : plusieurs fichiers distincts font un doublon
 */
function draftRadarrMovies(
	context: LinkContext,
	movies: readonly RadarrMovie[],
	queue: ArrQueue,
	groups: Map<string, FolderGroup>,
): MovieDraft[] {
	const downloadByMovieId = new Map(
		queue.records.flatMap(({ movieId, downloadId }) =>
			movieId === null ||
			movieId === undefined ||
			downloadId === null ||
			downloadId === undefined
				? []
				: [[movieId, downloadId.toLowerCase()] as const],
		),
	);
	return movies.map((movie) => {
		const folderPath = movie.path.replace(/\/+$/, "");
		const ownGroups = [...groups.values()].filter(
			(group) => group.path === folderPath || sameTitleAndYear(group, movie),
		);
		for (const group of ownGroups) groups.delete(group.path);
		const files = distinctByInode(ownGroups.flatMap((group) => group.files));
		const radarrFile =
			movie.movieFile === null || movie.movieFile === undefined
				? undefined
				: context.disk.byPath.get(movie.movieFile.path);
		const mainFile = radarrFile ?? largestFile(files);
		return {
			mainFile,
			mediaInfo:
				radarrFile === undefined ? null : (movie.movieFile?.mediaInfo ?? null),
			files: distinctByInode([
				...(mainFile === null ? [] : [mainFile]),
				...files,
			]),
			trackedBy: NasToolEnum.RADARR,
			downloadHash: downloadByMovieId.get(movie.id) ?? null,
			toolTmdbId: movie.tmdbId > 0 ? movie.tmdbId : null,
			jellyfinTmdbId: null,
			folder: {
				path: folderPath,
				...parseFolderName(path.posix.basename(folderPath)),
			},
			title: movie.title,
			year: movie.year ?? null,
		};
	});
}

// Un dossier qu'aucun outil ne suit : rangé sous l'identifiant de Jellyfin, s'il en a un
function draftFolder(context: LinkContext, group: FolderGroup): MovieDraft {
	const jellyfinItem = group.files
		.map((file) => context.jellyfin.byInode.get(file.inode))
		.find((item) => item !== undefined);
	return {
		mainFile: largestFile(group.files),
		mediaInfo: null,
		files: group.files,
		trackedBy: null,
		downloadHash: null,
		toolTmdbId: null,
		jellyfinTmdbId: readJellyfinTmdbId(jellyfinItem),
		folder: { path: group.path, title: group.title, year: group.year },
		title: jellyfinItem?.Name ?? null,
		year: jellyfinItem?.ProductionYear ?? group.year,
	};
}

// Un dossier hors de Radarr que Jellyfin range sous un film déjà relevé en est un fichier de plus
function mergeOrphans(
	drafts: MovieDraft[],
	orphans: MovieDraft[],
): MovieDraft[] {
	const merged = [...drafts];
	for (const orphan of orphans) {
		const target = merged.findIndex(
			(draft) =>
				orphan.jellyfinTmdbId !== null &&
				(draft.toolTmdbId ?? draft.jellyfinTmdbId) === orphan.jellyfinTmdbId,
		);
		if (target === -1) {
			merged.push(orphan);
			continue;
		}
		const draft = merged[target];
		merged[target] = {
			...draft,
			files: distinctByInode([...draft.files, ...orphan.files]),
		};
	}
	return merged;
}

function toSurveyedMovie(
	context: LinkContext,
	draft: MovieDraft,
): SurveyedMovie {
	const { entry, jellyfinItem } = buildNasEntry(context, draft);
	const jellyfinTmdbId =
		readJellyfinTmdbId(jellyfinItem) ?? draft.jellyfinTmdbId;
	return {
		tmdbId: draft.toolTmdbId ?? jellyfinTmdbId,
		toolTmdbId: draft.toolTmdbId,
		jellyfinTmdbId,
		folder: draft.folder,
		title: draft.title,
		year: draft.year,
		jellyfinCollection:
			jellyfinItem === null
				? null
				: (context.jellyfin.collectionByItemId.get(jellyfinItem.Id) ?? null),
		entry,
	};
}

/**
 * Les films du NAS (§8, étape 3) : ceux de Radarr, puis les dossiers de movies et movies_archives qu'il ne suit pas.
 * Le job ne lit pas le backlog et ne tranche pas quel identifiant est le bon : il note celui de chaque source
 * (surveyedMovieSchema), et l'instance locale relie
 */
export function surveyMovies(
	context: LinkContext,
	movies: readonly RadarrMovie[],
	queue: ArrQueue,
): { movies: SurveyedMovie[]; duplicates: ReportDuplicate[] } {
	const groups = groupVideoFolders(context, [
		context.roots.movies,
		context.roots.moviesArchives,
	]);
	const radarrDrafts = draftRadarrMovies(context, movies, queue, groups);
	const drafts = mergeOrphans(
		radarrDrafts,
		[...groups.values()].map((group) => draftFolder(context, group)),
	);
	return {
		movies: drafts.map((draft) => toSurveyedMovie(context, draft)),
		duplicates: drafts
			.filter(({ files }) => files.length > 1)
			.map((draft) =>
				describeDuplicate(
					context,
					draft.year === null
						? (draft.title ?? draft.folder?.title ?? "?")
						: `${draft.title ?? draft.folder?.title ?? "?"} (${draft.year})`,
					draft.files,
				),
			),
	};
}
