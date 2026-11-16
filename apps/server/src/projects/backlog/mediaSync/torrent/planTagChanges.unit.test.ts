import { describe, expect, it } from "vitest";

import { planTagChanges } from "./planTagChanges.ts";
import { TorrentStatusEnum } from "./torrentStatus.enum.ts";

function torrent(hash: string, status: TorrentStatusEnum, tags: string[]) {
	return {
		hash,
		name: hash,
		category: null,
		tags,
		addedAt: "2026-11-01T00:00:00.000Z",
		progress: 1,
		sizeBytes: 1,
		status,
		tracker: null,
		message: null,
		filePaths: [],
		inodes: [],
		isOther: false,
	};
}

describe("planTagChanges.ts", () => {
	describe("changes", () => {
		it("SHOULD tag the new dead and untag those that came back", () => {
			expect(
				planTagChanges([
					torrent("new-dead", TorrentStatusEnum.DEAD, []),
					torrent("still-dead", TorrentStatusEnum.DEAD, ["tracker-invalide"]),
					torrent("back", TorrentStatusEnum.VALID, [
						"tracker-invalide",
						"cross-seed",
					]),
					torrent("inactive", TorrentStatusEnum.INACTIVE, []),
				]),
			).toStrictEqual({ toAdd: ["new-dead"], toRemove: ["back"] });
		});
	});
});
