import type { BossDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossDto.type";
import { describe, expect, it } from "vitest";

import { fromBossDtoToBossFm } from "./fromBossDtoToBossFm";

function buildBoss(deaths: BossDto["deaths"]): BossDto {
	return {
		id: 3,
		name: "Margit",
		firstTry: null,
		lastTry: null,
		defeatedAt: null,
		totalDeath: deaths.length,
		deaths,
	};
}

describe("fromBossDtoToBossFm.ts", () => {
	describe("deaths order", () => {
		it("SHOULD show the most recent death first", () => {
			const boss = fromBossDtoToBossFm(
				buildBoss([
					{ id: 7, date: "2026-10-01T20:00:00.000Z", comment: null },
					{ id: 8, date: "2026-10-03T20:00:00.000Z", comment: "Presque" },
					{ id: 9, date: "2026-10-02T20:00:00.000Z", comment: null },
				]),
			);

			expect(boss.deaths.map((death) => death.id)).toStrictEqual([8, 9, 7]);
		});

		it("SHOULD put the latest created first WHEN two deaths share the same date", () => {
			const date = "2026-10-01T20:00:00.000Z";
			const boss = fromBossDtoToBossFm(
				buildBoss([
					{ id: 7, date, comment: null },
					{ id: 8, date, comment: null },
					{ id: -1, date, comment: null },
					{ id: -2, date, comment: null },
				]),
			);

			expect(boss.deaths.map((death) => death.id)).toStrictEqual([
				-2, -1, 8, 7,
			]);
		});
	});

	describe("optimistic death", () => {
		it("SHOULD flag the death not yet confirmed by the server", () => {
			const [death] = fromBossDtoToBossFm(
				buildBoss([
					{ id: -1, date: "2026-10-01T20:00:00.000Z", comment: null },
				]),
			).deaths;

			expect(death).toStrictEqual({
				id: -1,
				date: "2026-10-01T20:00:00.000Z",
				comment: null,
				isTemporary: true,
			});
		});
	});
});
