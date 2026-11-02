import { describe, expect, it } from "vitest";

import { useFakeClock } from "./useFakeClock.ts";

const START = new Date("2026-11-02T10:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

describe("useFakeClock.ts", () => {
	describe("frozen time", () => {
		it("SHOULD start at the given date WHEN used", () => {
			// Act
			useFakeClock(START);

			// Assert
			expect(Date.now()).toBe(START.getTime());
			expect(new Date().toISOString()).toBe(START.toISOString());
		});

		it("SHOULD jump forward WHEN advanced", () => {
			// Arrange
			const clock = useFakeClock(START);

			// Act
			clock.advance(30 * DAY_MS);

			// Assert
			expect(new Date().toISOString()).toBe("2026-12-02T10:00:00.000Z");
		});

		it("SHOULD keep the timers real WHEN the clock is fake", async () => {
			// Arrange
			useFakeClock(START);

			// Act : une vraie minuterie se déclenche, sans qu'on avance l'horloge
			const hasFired = await new Promise<boolean>((resolve) => {
				setTimeout(() => {
					resolve(true);
				}, 1);
			});

			// Assert
			expect(hasFired).toBe(true);
		});
	});

	describe("after the test", () => {
		it("SHOULD give the real time back WHEN a previous test faked it", () => {
			// performance n'est jamais simulé : l'heure réelle
			const realNow = performance.timeOrigin + performance.now();

			expect(Math.abs(Date.now() - realNow)).toBeLessThan(1000);
		});
	});
});
