import { describe, expect, it } from "vitest";

import { TorrentStatusEnum } from "../torrent/torrentStatus.enum.ts";
import { isWithoutMedia } from "./isWithoutMedia.ts";

const TORRENT = {
	hash: "ABC",
	name: "n",
	category: "movies",
	tags: [],
	addedAt: "2026-11-01T00:00:00.000Z",
	progress: 1,
	sizeBytes: 1,
	status: TorrentStatusEnum.VALID,
	tracker: null,
	message: null,
	filePaths: ["/data/torrents/movies/n.mkv"],
	inodes: [7],
	isOther: false,
};
const MEDIAS = "/data/medias/";

describe("isWithoutMedia.ts", () => {
	describe("without media", () => {
		it("SHOULD flag a torrent whose files are only in torrents/", () => {
			const disk = {
				pathsByInode: new Map([[7, ["/data/torrents/movies/n.mkv"]]]),
			};
			expect(isWithoutMedia(TORRENT, disk, MEDIAS, new Set())).toBe(true);
		});
	});

	describe("with media", () => {
		it("SHOULD not flag a torrent linked to a library, still expected, or never downloaded", () => {
			const linked = {
				pathsByInode: new Map([
					[7, ["/data/torrents/movies/n.mkv", "/data/medias/movies/N/n.mkv"]],
				]),
			};
			const alone = {
				pathsByInode: new Map([[7, ["/data/torrents/movies/n.mkv"]]]),
			};
			expect(isWithoutMedia(TORRENT, linked, MEDIAS, new Set())).toBe(false);
			expect(isWithoutMedia(TORRENT, alone, MEDIAS, new Set(["abc"]))).toBe(
				false,
			);
			expect(
				isWithoutMedia({ ...TORRENT, progress: 0 }, alone, MEDIAS, new Set()),
			).toBe(false);
		});
	});
});
