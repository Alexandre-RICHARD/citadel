import { describe, expect, it } from "vitest";

import { createBanList } from "./createBanList.ts";

const MINUTE_MS = 60_000;

function createClock() {
	let currentTime = 0;
	return {
		now: () => currentTime,
		advance(milliseconds: number): void {
			currentTime += milliseconds;
		},
	};
}

describe("createBanList.ts", () => {
	describe("ban", () => {
		it("SHOULD accept the key WHEN it was never banned", () => {
			expect(createBanList().getRemainingMs("203.0.113.1")).toBeNull();
		});

		it("SHOULD give the remaining time WHEN the key is banned", () => {
			// Arrange
			const clock = createClock();
			const banList = createBanList({ now: clock.now });
			banList.ban("203.0.113.1", 15 * MINUTE_MS);

			// Act
			clock.advance(5 * MINUTE_MS);

			// Assert
			expect(banList.getRemainingMs("203.0.113.1")).toBe(10 * MINUTE_MS);
		});

		it("SHOULD accept the key again WHEN the ban is over", () => {
			// Arrange
			const clock = createClock();
			const banList = createBanList({ now: clock.now });
			banList.ban("203.0.113.1", 15 * MINUTE_MS);

			// Act
			clock.advance(15 * MINUTE_MS);

			// Assert
			expect(banList.getRemainingMs("203.0.113.1")).toBeNull();
		});

		it("SHOULD keep a longer ban WHEN a shorter one comes after", () => {
			// Arrange
			const clock = createClock();
			const banList = createBanList({ now: clock.now });
			banList.ban("alex", 15 * MINUTE_MS);

			// Act
			banList.ban("alex", 2000);

			// Assert
			expect(banList.getRemainingMs("alex")).toBe(15 * MINUTE_MS);
		});

		it("SHOULD leave the other keys accepted WHEN one key is banned", () => {
			// Arrange
			const banList = createBanList();

			// Act
			banList.ban("203.0.113.1", MINUTE_MS);

			// Assert
			expect(banList.getRemainingMs("203.0.113.2")).toBeNull();
		});
	});

	describe("forget", () => {
		it("SHOULD accept the key at once WHEN its ban is forgotten", () => {
			// Arrange
			const banList = createBanList();
			banList.ban("alex", MINUTE_MS);

			// Act
			banList.forget("alex");

			// Assert
			expect(banList.getRemainingMs("alex")).toBeNull();
		});
	});
});
