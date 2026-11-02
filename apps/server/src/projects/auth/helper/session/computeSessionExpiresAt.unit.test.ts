import { describe, expect, it } from "vitest";

import { computeSessionExpiresAt } from "./computeSessionExpiresAt.ts";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const SETTINGS = {
	rememberMs: 7 * DAY_MS,
	idleMs: 12 * HOUR_MS,
	absoluteMs: 30 * DAY_MS,
	touchMs: 5 * 60 * 1000,
};
const SEEN_AT = new Date("2026-11-02T10:00:00.000Z");
const FAR_CAP = new Date(SEEN_AT.getTime() + 30 * DAY_MS);

describe("computeSessionExpiresAt.ts", () => {
	describe("idle duration", () => {
		it("SHOULD end 7 days after the last action WHEN the user asked to be remembered", () => {
			expect(
				computeSessionExpiresAt(
					{ remember: true, seenAt: SEEN_AT, absoluteExpiresAt: FAR_CAP },
					SETTINGS,
				),
			).toStrictEqual(new Date("2026-11-09T10:00:00.000Z"));
		});

		it("SHOULD end 12 hours after the last action WHEN the user did not ask to be remembered", () => {
			expect(
				computeSessionExpiresAt(
					{ remember: false, seenAt: SEEN_AT, absoluteExpiresAt: FAR_CAP },
					SETTINGS,
				),
			).toStrictEqual(new Date("2026-11-02T22:00:00.000Z"));
		});
	});

	describe("absolute cap", () => {
		it("SHOULD stop at the cap WHEN the idle duration would go beyond it", () => {
			const absoluteExpiresAt = new Date(SEEN_AT.getTime() + DAY_MS);

			expect(
				computeSessionExpiresAt(
					{ remember: true, seenAt: SEEN_AT, absoluteExpiresAt },
					SETTINGS,
				),
			).toStrictEqual(absoluteExpiresAt);
		});
	});
});
