import { describe, expect, it } from "vitest";

import { buildDiskIndex } from "./buildDiskIndex.ts";

const MOVIE = {
	path: "/data/medias/movies/Ça (2017)/ca.mkv",
	inode: 1,
	sizeBytes: 10,
};
const TORRENT = {
	path: "/data/torrents/movies/ca.mkv",
	inode: 1,
	sizeBytes: 10,
};

describe("buildDiskIndex.ts", () => {
	describe("folders", () => {
		it("SHOULD list the files under a folder, at any depth", () => {
			const index = buildDiskIndex([MOVIE, TORRENT]);
			expect(index.under("/data/medias")).toStrictEqual([MOVIE]);
			expect(index.under("/data/")).toStrictEqual([MOVIE, TORRENT]);
		});
	});

	describe("hard links", () => {
		it("SHOULD give every name of a file", () => {
			expect(
				buildDiskIndex([MOVIE, TORRENT]).pathsByInode.get(1),
			).toStrictEqual([MOVIE.path, TORRENT.path]);
		});
	});
});
