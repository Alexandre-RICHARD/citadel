import { describe, expect, it } from "vitest";

import { buildSurveyedMovie } from "../../../../testUtils/unit/backlog/buildSurveyedMovie.ts";
import { indexMediaSurvey } from "./indexMediaSurvey.ts";
import { keepValidVerifications } from "./keepValidVerifications.ts";

const VERIFIED_AT = "2026-11-01T10:00:00.000Z";

function verification(key: string, inode: number, sizeBytes: number) {
	return { key, inode, sizeBytes, verifiedAt: VERIFIED_AT };
}

const INDEX = indexMediaSurvey({
	formatVersion: 1,
	surveyedAt: VERIFIED_AT,
	jellyfinServerId: null,
	movies: [
		buildSurveyedMovie(603, { inode: 10, sizeBytes: 100 }),
		buildSurveyedMovie(604, { inode: 20, sizeBytes: 200, fileCount: 2 }),
	],
	shows: [],
	unlinked: [],
});

describe("keepValidVerifications.ts", () => {
	describe("still valid", () => {
		it("SHOULD keep a case WHEN the file is the same", () => {
			expect(
				keepValidVerifications([verification("movie:603", 10, 100)], INDEX),
			).toHaveLength(1);
		});
	});

	describe("no longer valid", () => {
		it.each([
			{
				reason: "the file was replaced",
				key: "movie:603",
				inode: 11,
				size: 100,
			},
			{
				reason: "the file size changed",
				key: "movie:603",
				inode: 10,
				size: 101,
			},
			{
				reason: "the movie has two files",
				key: "movie:604",
				inode: 20,
				size: 200,
			},
			{
				reason: "the movie left the NAS",
				key: "movie:605",
				inode: 10,
				size: 100,
			},
			{
				reason: "the key is unreadable",
				key: "film:603",
				inode: 10,
				size: 100,
			},
		])("SHOULD drop a case WHEN $reason", ({ key, inode, size }) => {
			expect(
				keepValidVerifications([verification(key, inode, size)], INDEX),
			).toStrictEqual([]);
		});
	});
});
