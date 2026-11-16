import { MediaImportRejectionEnum } from "@citadel/specs/src/projects/backlog/enum/mediaImportRejection.enum.ts";
import { MediaImportStatusEnum } from "@citadel/specs/src/projects/backlog/enum/mediaImportStatus.enum.ts";
import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import { describe, expect, it } from "vitest";

import { createMediaImportJob } from "./createMediaImportJob.ts";

const RECOGNIZED = {
	mediaType: MediaTypeEnum.MOVIE,
	tmdbId: 603,
	title: "Matrix",
	date: "1999-03-30",
	posterPath: "/matrix.jpg",
};
const REJECTED = {
	mediaType: MediaTypeEnum.SHOW,
	tmdbId: 1,
	reason: MediaImportRejectionEnum.TMDB_NOT_FOUND,
};

function createClock() {
	let time = Date.parse("2026-11-16T10:00:00Z");
	return {
		now: () => time,
		advance: (ms: number) => {
			time += ms;
		},
	};
}

describe("createMediaImportJob.ts", () => {
	describe("reading", () => {
		it("SHOULD give the progress only WHEN the import is still reading", () => {
			const job = createMediaImportJob(3);
			job.markRead(2);
			job.recognize([RECOGNIZED]);
			job.reject([REJECTED]);

			expect(job.toBean()).toStrictEqual({
				status: MediaImportStatusEnum.READING,
				readCount: 2,
				totalCount: 3,
				recognized: [],
				rejected: [],
			});
		});
	});

	describe("ready", () => {
		it("SHOULD give the recognized and rejected media WHEN the import is complete", () => {
			const job = createMediaImportJob(2);
			job.recognize([RECOGNIZED]);
			job.reject([REJECTED]);
			job.markRead(2);

			job.complete();

			expect(job.toBean()).toStrictEqual({
				status: MediaImportStatusEnum.READY,
				readCount: 2,
				totalCount: 2,
				recognized: [RECOGNIZED],
				rejected: [REJECTED],
			});
		});
	});

	describe("expiry", () => {
		it("SHOULD expire WHEN it finished longer ago than the lifetime", () => {
			const clock = createClock();
			const job = createMediaImportJob(1, clock.now);
			job.fail();

			clock.advance(1001);

			expect(job.hasExpired(1000)).toBe(true);
		});

		it("SHOULD never expire WHEN it is still reading", () => {
			const clock = createClock();
			const job = createMediaImportJob(1, clock.now);

			clock.advance(10_000);

			expect(job.hasExpired(1000)).toBe(false);
		});
	});
});
