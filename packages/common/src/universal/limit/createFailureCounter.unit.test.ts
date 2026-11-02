import { describe, expect, it } from "vitest";

import { createFailureCounter } from "./createFailureCounter.ts";

const RESET_MS = 15 * 60_000;

function createClock() {
	let currentTime = 0;
	return {
		now: () => currentTime,
		advance(milliseconds: number): void {
			currentTime += milliseconds;
		},
	};
}

describe("createFailureCounter.ts", () => {
	describe("count", () => {
		it("SHOULD count the successive failures WHEN they keep coming", () => {
			// Arrange
			const counter = createFailureCounter({ resetMs: RESET_MS });
			counter.record("alex");
			counter.record("alex");

			// Act
			const count = counter.record("alex");

			// Assert
			expect(count).toBe(3);
		});

		it("SHOULD count each key apart WHEN two keys fail", () => {
			// Arrange
			const counter = createFailureCounter({ resetMs: RESET_MS });
			counter.record("alex");

			// Act
			const count = counter.record("sam");

			// Assert
			expect(count).toBe(1);
		});
	});

	describe("reset", () => {
		it("SHOULD start again from one WHEN the key was reset by a success", () => {
			// Arrange
			const counter = createFailureCounter({ resetMs: RESET_MS });
			counter.record("alex");
			counter.record("alex");

			// Act
			counter.reset("alex");

			// Assert
			expect(counter.record("alex")).toBe(1);
		});

		it("SHOULD start again from one WHEN the key stayed calm long enough", () => {
			// Arrange
			const clock = createClock();
			const counter = createFailureCounter({
				resetMs: RESET_MS,
				now: clock.now,
			});
			counter.record("alex");
			counter.record("alex");

			// Act
			clock.advance(RESET_MS);

			// Assert
			expect(counter.record("alex")).toBe(1);
		});

		it("SHOULD keep counting WHEN failures come just before the calm ends", () => {
			// Arrange
			const clock = createClock();
			const counter = createFailureCounter({
				resetMs: RESET_MS,
				now: clock.now,
			});
			counter.record("alex");

			// Act
			clock.advance(RESET_MS - 1);

			// Assert
			expect(counter.record("alex")).toBe(2);
		});
	});
});
