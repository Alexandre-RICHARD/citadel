import { NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum.ts";
import { describe, expect, it } from "vitest";

import { TorrentStatusEnum } from "../torrent/torrentStatus.enum.ts";
import { describeStorage } from "./describeStorage.ts";

const DOWNLOADING = {
	hash: "abc",
	name: "n",
	category: null,
	tags: [],
	addedAt: "2026-11-01T00:00:00.000Z",
	progress: 0.4,
	sizeBytes: 1,
	status: TorrentStatusEnum.VALID,
	tracker: null,
	message: null,
	filePaths: [],
	inodes: [],
	isOther: false,
};
const CONTEXT = { torrentsByHash: new Map([["abc", DOWNLOADING]]) };
const NONE = {
	isInJellyfin: false,
	hasFile: false,
	downloadHash: null,
	isTracked: false,
};

describe("describeStorage.ts", () => {
	describe("file", () => {
		it("SHOULD say where the file is", () => {
			expect(
				describeStorage(CONTEXT, {
					...NONE,
					isInJellyfin: true,
					hasFile: true,
				}),
			).toBe(NasStorageEnum.IN_JELLYFIN);
			expect(describeStorage(CONTEXT, { ...NONE, hasFile: true })).toBe(
				NasStorageEnum.PRESENT,
			);
		});
	});

	describe("no file", () => {
		it("SHOULD say downloading, expected or not tracked", () => {
			expect(
				describeStorage(CONTEXT, {
					...NONE,
					downloadHash: "abc",
					isTracked: true,
				}),
			).toBe(NasStorageEnum.DOWNLOADING);
			expect(describeStorage(CONTEXT, { ...NONE, isTracked: true })).toBe(
				NasStorageEnum.EXPECTED,
			);
			expect(describeStorage(CONTEXT, NONE)).toBe(NasStorageEnum.NOT_TRACKED);
		});
	});
});
