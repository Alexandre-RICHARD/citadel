import { LanguageTagEnum } from "@citadel/specs/src/projects/backlog/enum/languageTag.enum.ts";
import { NasQualityEnum } from "@citadel/specs/src/projects/backlog/enum/nasQuality.enum.ts";
import { NasSharingEnum } from "@citadel/specs/src/projects/backlog/enum/nasSharing.enum.ts";
import { NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum.ts";
import { describe, expect, it } from "vitest";

import { aggregateNas } from "./aggregateNas.ts";
import type { NasDetailsBean } from "./nasDetailsBean.type.ts";

const NO_JELLYFIN = { jellyfinItemId: null, jellyfinCollection: null };

function episode(details: Partial<NasDetailsBean>): NasDetailsBean {
	return {
		storage: NasStorageEnum.IN_JELLYFIN,
		episodeCount: null,
		fileCount: 1,
		jellyfinItemId: null,
		jellyfinCollection: null,
		sharing: NasSharingEnum.SEEDING,
		torrents: [],
		quality: NasQualityEnum.FHD,
		languageTags: [{ tag: LanguageTagEnum.VF, count: 1 }],
		sizeBytes: 1_000_000_000,
		gbPerHour: 1,
		fileMinutes: 60,
		isRuntimeMismatch: false,
		gaps: [],
		verifiedCount: 0,
		verifiableCount: 1,
		...details,
	};
}

describe("aggregateNas.ts", () => {
	describe("worst and best states", () => {
		it("SHOULD keep the least advanced storage and the lowest quality", () => {
			const season = aggregateNas(
				[
					episode({}),
					episode({
						storage: NasStorageEnum.PRESENT,
						quality: NasQualityEnum.HD,
					}),
				],
				NO_JELLYFIN,
			);
			expect(season.storage).toBe(NasStorageEnum.PRESENT);
			expect(season.quality).toBe(NasQualityEnum.HD);
		});

		it("SHOULD keep the best sharing state", () => {
			expect(
				aggregateNas(
					[episode({ sharing: NasSharingEnum.NONE }), episode({})],
					NO_JELLYFIN,
				).sharing,
			).toBe(NasSharingEnum.SEEDING);
		});
	});

	describe("counts and sums", () => {
		it("SHOULD count the files, the tags and the verified cases, and add up the sizes", () => {
			const season = aggregateNas(
				[
					episode({ verifiedCount: 1 }),
					episode({ languageTags: [] }),
					episode({
						fileCount: 0,
						storage: NasStorageEnum.EXPECTED,
						sizeBytes: null,
						fileMinutes: null,
						quality: null,
						languageTags: [],
						verifiableCount: 0,
					}),
				],
				NO_JELLYFIN,
			);
			expect(season).toMatchObject({
				storage: NasStorageEnum.EXPECTED,
				episodeCount: 3,
				fileCount: 2,
				languageTags: [{ tag: LanguageTagEnum.VF, count: 1 }],
				sizeBytes: 2_000_000_000,
				gbPerHour: 1,
				verifiedCount: 1,
				verifiableCount: 2,
			});
		});

		it("SHOULD list a season torrent once WHEN it is linked to every episode", () => {
			const torrent = {
				name: "season",
				trackerName: "Tracker A",
				sharing: NasSharingEnum.SEEDING,
			};
			expect(
				aggregateNas(
					[episode({ torrents: [torrent] }), episode({ torrents: [torrent] })],
					NO_JELLYFIN,
				).torrents,
			).toStrictEqual([torrent]);
		});
	});

	describe("no aired episode", () => {
		it("SHOULD say nothing is on the NAS WHEN there is no episode", () => {
			expect(aggregateNas([], NO_JELLYFIN)).toMatchObject({
				storage: NasStorageEnum.NOT_TRACKED,
				fileCount: 0,
				sizeBytes: null,
				quality: null,
			});
		});
	});
});
