import {
	linkSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { NasGapKindEnum } from "@citadel/specs/src/projects/backlog/enum/nasGapKind.enum.ts";
import { NasSharingEnum } from "@citadel/specs/src/projects/backlog/enum/nasSharing.enum.ts";
import { NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum.ts";
import { MediaStatePathEnum } from "@citadel/specs/src/projects/backlog/mediaState/mediaStatePath.enum.ts";
import { mediaSurveySchema } from "@citadel/specs/src/projects/backlog/mediaState/mediaSurveySchema.ts";
import { CrossSeedSearchEnum } from "@citadel/specs/src/projects/backlog/mediaSyncReport/crossSeedSearch.enum.ts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MediaSyncSettings } from "../settings/mediaSyncSettings.type.ts";
import type { MediaSyncClients } from "./mediaSyncClients.type.ts";
import { runMediaSync } from "./runMediaSync.ts";

let root = "";
let data = "";

// Un fichier de `sizeBytes` octets, ses dossiers créés
function writeSized(relativePath: string, sizeBytes: number): string {
	const filePath = `${data}/${relativePath}`;
	mkdirSync(path.dirname(filePath), { recursive: true });
	writeFileSync(filePath, Buffer.alloc(sizeBytes));
	return filePath;
}

function settings(): MediaSyncSettings {
	return {
		dataDir: data,
		mediaStateDir: `${root}/media-state`,
		citadelStateDir: `${root}/state`,
		radarr: { url: "http://radarr", apiKey: "k" },
		sonarr: { url: "http://sonarr", apiKey: "k" },
		jellyfin: { url: "http://jellyfin", apiKey: "k" },
		qbittorrent: { url: "http://qbittorrent", user: "u", password: "p" },
		trackers: [{ name: "Tracker A", urls: ["https://a.example/announce/key"] }],
		crossSeedSearch: CrossSeedSearchEnum.NOT_SCHEDULED,
	};
}

function torrentEntry(
	hash: string,
	fileName: string,
	{
		progress = 1,
		status = 2,
		tags = "",
	}: { progress?: number; status?: number; tags?: string } = {},
) {
	return {
		torrent: {
			hash,
			name: hash,
			save_path: `${data}/torrents/movies`,
			category: "movies",
			tags,
			added_on: 1_700_000_000,
			progress,
			size: 100,
			state: "stalledUP",
		},
		fileNames: [fileName],
		trackers: [
			{
				url: "https://a.example/announce/key",
				status,
				msg: status === 4 ? "unregistered" : "",
			},
		],
	};
}

function clients(): MediaSyncClients {
	return {
		radarr: {
			movies: () =>
				Promise.resolve([
					{
						id: 1,
						tmdbId: 603,
						title: "Matrix",
						year: 1999,
						path: `${data}/medias/movies/Matrix (1999)`,
						movieFile: {
							path: `${data}/medias/movies/Matrix (1999)/matrix.mkv`,
							size: 300,
							mediaInfo: {
								resolution: "1920x800",
								runTime: "2:16:00",
								audioLanguages: "French/English",
								subtitles: "French",
							},
						},
					},
				]),
			queue: () => Promise.resolve({ records: [] }),
		},
		sonarr: {
			seriesDetails: () =>
				Promise.resolve([
					{
						series: {
							id: 7,
							tmdbId: 1396,
							title: "Breaking Bad",
							year: 2008,
							path: `${data}/medias/series/Breaking Bad (2008)`,
						},
						episodes: [
							{ id: 70, seasonNumber: 1, episodeNumber: 1, episodeFileId: 700 },
							{
								id: 71,
								seasonNumber: 1,
								episodeNumber: 2,
								episodeFileId: null,
							},
							{
								id: 72,
								seasonNumber: 0,
								episodeNumber: 1,
								episodeFileId: null,
							},
						],
						files: [
							{
								id: 700,
								path: `${data}/medias/series/Breaking Bad (2008)/Season 01/Breaking.Bad.S01E01.mkv`,
								size: 50,
							},
						],
					},
				]),
			queue: () => Promise.resolve({ records: [] }),
		},
		jellyfin: {
			library: () =>
				Promise.resolve({
					serverId: "server-1",
					movies: [
						{
							Id: "item-603",
							Path: `${data}/medias/movies/Matrix (1999)/matrix.mkv`,
							ProviderIds: { Tmdb: "603" },
						},
						{
							Id: "item-348",
							Name: "Alien",
							ProductionYear: 1979,
							Path: `${data}/medias/movies_archives/Alien (1979)/alien.mkv`,
							ProviderIds: { Tmdb: "348" },
						},
					],
					series: [],
					episodes: [],
					collections: [{ name: "Matrix", itemIds: ["item-603"] }],
				}),
		},
		qbittorrent: {
			entries: () =>
				Promise.resolve([
					torrentEntry("valid", "matrix.mkv"),
					torrentEntry("dead", "orphan.mkv", { status: 4 }),
					torrentEntry("zero", "never.mkv", { progress: 0, status: 1 }),
					torrentEntry("back", "back.mkv", { tags: "tracker-invalide" }),
				]),
			addTag: vi.fn(() => Promise.resolve()),
			removeTag: vi.fn(() => Promise.resolve()),
		},
	};
}

beforeEach(() => {
	root = mkdtempSync(path.join(tmpdir(), "media-sync-")).replaceAll("\\", "/");
	data = `${root}/data`;
	mkdirSync(`${root}/media-state/survey`, { recursive: true });
	const matrix = writeSized("torrents/movies/matrix.mkv", 300);
	mkdirSync(`${data}/medias/movies/Matrix (1999)`, { recursive: true });
	linkSync(matrix, `${data}/medias/movies/Matrix (1999)/matrix.mkv`);
	writeSized("medias/movies_archives/Matrix (1999)/matrix-old.mkv", 200);
	writeSized("medias/movies_archives/Alien (1979)/alien.mkv", 150);
	writeSized("medias/movies_archives/Sans nom/film.mkv", 10);
	writeSized(
		"medias/series/Breaking Bad (2008)/Season 01/Breaking.Bad.S01E01.mkv",
		50,
	);
	writeSized("torrents/movies/orphan.mkv", 20);
	writeSized("torrents/movies/back.mkv", 20);
});

afterEach(() => {
	rmSync(root, { recursive: true, force: true });
});

describe("runMediaSync.ts", () => {
	describe("survey", () => {
		it("SHOULD link each file to its tool, Jellyfin and torrents, and keep what every source says", async () => {
			// Act
			await runMediaSync(settings(), clients());

			// Assert
			const survey = mediaSurveySchema.parse(
				JSON.parse(
					readFileSync(
						`${root}/media-state/${MediaStatePathEnum.CURRENT_SURVEY}`,
						"utf8",
					),
				),
			);
			const byFolder = new Map(
				survey.movies.map((movie) => [movie.folder?.title, movie]),
			);
			const matrix = byFolder.get("Matrix");
			const alien = byFolder.get("Alien");
			const unnamed = byFolder.get("Sans nom");
			expect(matrix).toMatchObject({
				tmdbId: 603,
				toolTmdbId: 603,
				jellyfinTmdbId: 603,
				jellyfinCollection: "Matrix",
			});
			expect(matrix?.entry).toMatchObject({
				storage: NasStorageEnum.IN_JELLYFIN,
				fileCount: 2,
				gaps: [{ kind: NasGapKindEnum.DUPLICATE, fileCount: 2 }],
				torrents: [
					{
						hash: "valid",
						trackerName: "Tracker A",
						sharing: NasSharingEnum.SEEDING,
					},
				],
			});
			expect(matrix?.entry.file).toMatchObject({
				quality: "fhd",
				durationMinutes: 136,
				audioLanguages: ["fr", "en"],
				subtitleLanguages: ["fr"],
			});
			expect(alien).toMatchObject({
				tmdbId: 348,
				toolTmdbId: null,
				jellyfinTmdbId: 348,
				title: "Alien",
			});
			expect(alien?.entry.gaps).toStrictEqual([
				{ kind: NasGapKindEnum.UNTRACKED },
			]);
			expect(unnamed).toMatchObject({
				tmdbId: null,
				folder: { title: "Sans nom", year: null },
			});
			expect(
				survey.shows
					.at(0)
					?.episodes.map(({ seasonNumber, episodeNumber, entry }) => [
						seasonNumber,
						episodeNumber,
						entry.storage,
					]),
			).toStrictEqual([
				[1, 1, NasStorageEnum.PRESENT],
				[1, 2, NasStorageEnum.EXPECTED],
			]);
		});
	});

	describe("torrents", () => {
		it("SHOULD tag the dead, untag those back, and report them", async () => {
			// Arrange
			const fakes = clients();

			// Act
			const report = await runMediaSync(settings(), fakes);

			// Assert
			expect(fakes.qbittorrent.addTag).toHaveBeenCalledWith(
				["dead"],
				"tracker-invalide",
			);
			expect(fakes.qbittorrent.removeTag).toHaveBeenCalledWith(
				["back"],
				"tracker-invalide",
			);
			expect(report.summary).toMatchObject({
				torrentCount: 4,
				validCount: 2,
				deadFinishedCount: 1,
				inactiveCount: 1,
				withoutMediaCount: 2,
				neverDownloadedCount: 1,
				duplicateCount: 1,
				withoutTorrentCount: 3,
			});
			expect(report.deadFinished.at(0)).toMatchObject({
				name: "dead",
				trackerName: "Tracker A",
				message: "unregistered",
			});
		});
	});

	describe("previous run", () => {
		it("SHOULD keep the previous survey and compare with the previous report", async () => {
			// Arrange
			await runMediaSync(settings(), clients());

			// Act
			const report = await runMediaSync(settings(), clients());

			// Assert
			expect(report.previousSummary?.torrentCount).toBe(4);
			expect(() =>
				readFileSync(
					`${root}/media-state/${MediaStatePathEnum.PREVIOUS_SURVEY}`,
				),
			).not.toThrow();
		});
	});
});
