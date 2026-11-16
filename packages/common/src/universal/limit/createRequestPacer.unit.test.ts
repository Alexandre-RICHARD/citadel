import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createRequestPacer } from "./createRequestPacer.ts";

const GAP_MS = 50;

// Lance un appel et note l'heure (factice) à laquelle il part
function startAndRecord(
	pacer: ReturnType<typeof createRequestPacer>,
	starts: number[],
): Promise<void> {
	return pacer.waitForTurn().then(() => {
		starts.push(Date.now());
	});
}

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(Date.parse("2026-11-16T10:00:00Z"));
});

afterEach(() => {
	vi.useRealTimers();
});

describe("createRequestPacer.ts", () => {
	describe("waitForTurn", () => {
		it("SHOULD space simultaneous calls by the gap, in their order of arrival", async () => {
			const pacer = createRequestPacer(GAP_MS);
			const origin = Date.now();
			const starts: number[] = [];

			const all = Promise.all([
				startAndRecord(pacer, starts),
				startAndRecord(pacer, starts),
				startAndRecord(pacer, starts),
			]);
			await vi.advanceTimersByTimeAsync(2 * GAP_MS);
			await all;

			expect(starts.map((start) => start - origin)).toStrictEqual([
				0,
				GAP_MS,
				2 * GAP_MS,
			]);
		});

		it("SHOULD start at once WHEN the previous call left more than the gap ago", async () => {
			const pacer = createRequestPacer(GAP_MS);
			await pacer.waitForTurn();
			await vi.advanceTimersByTimeAsync(3 * GAP_MS);
			const before = Date.now();
			const starts: number[] = [];

			await startAndRecord(pacer, starts);

			expect(starts).toStrictEqual([before]);
		});
	});
});
