import { describe, expect, it } from "vitest";

import { classifyTorrentStatus } from "./classifyTorrentStatus.ts";
import { createTrackerNamer } from "./createTrackerNamer.ts";
import { TorrentStatusEnum } from "./torrentStatus.enum.ts";

const nameTracker = createTrackerNamer([
	{ name: "Tracker A", urls: ["https://a.example/1", "https://a2.example/1"] },
]);

function entry(statuses: number[], state = "stalledUP") {
	return {
		torrent: {
			hash: "h",
			name: "n",
			save_path: "/data/torrents/movies",
			added_on: 0,
			progress: 1,
			size: 1,
			state,
		},
		fileNames: [],
		trackers: statuses.map((status, index) => ({
			url: index === 0 ? "https://a.example/key" : "https://a2.example/key",
			status,
		})),
	};
}

const REACHABLE = new Set(["Tracker A"]);

describe("classifyTorrentStatus.ts", () => {
	describe("valid", () => {
		it("SHOULD be valid WHEN one address works, even if the other refuses", () => {
			expect(classifyTorrentStatus(entry([4, 2]), nameTracker, REACHABLE)).toBe(
				TorrentStatusEnum.VALID,
			);
		});
	});

	describe("dead", () => {
		it("SHOULD be dead WHEN the tracker answers other torrents but none of its addresses works here", () => {
			expect(classifyTorrentStatus(entry([4, 4]), nameTracker, REACHABLE)).toBe(
				TorrentStatusEnum.DEAD,
			);
		});
	});

	describe("inactive", () => {
		it("SHOULD be inactive WHEN the tracker answers no torrent at all", () => {
			expect(classifyTorrentStatus(entry([4]), nameTracker, new Set())).toBe(
				TorrentStatusEnum.INACTIVE,
			);
		});

		it("SHOULD be inactive WHEN not contacted yet, or in error in qBittorrent", () => {
			expect(classifyTorrentStatus(entry([1, 4]), nameTracker, REACHABLE)).toBe(
				TorrentStatusEnum.INACTIVE,
			);
			expect(
				classifyTorrentStatus(
					entry([4], "missingFiles"),
					nameTracker,
					REACHABLE,
				),
			).toBe(TorrentStatusEnum.INACTIVE);
		});
	});
});
