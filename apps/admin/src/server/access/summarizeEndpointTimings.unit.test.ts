import { describe, expect, it } from "vitest";

import type { AccessEntry } from "../../shared/accessEntry.type.ts";
import { summarizeEndpointTimings } from "./summarizeEndpointTimings.ts";

function entry(
	path: string,
	durationMs: number | null,
	overrides: Partial<AccessEntry> = {},
): AccessEntry {
	return {
		at: "2026-11-13T10:00:00.000Z",
		ip: "1.1.1.1",
		country: "FR",
		method: "GET",
		host: "alexandre-richard.fr",
		path,
		status: 200,
		durationMs,
		...overrides,
	};
}

describe("summarizeEndpointTimings.ts", () => {
	describe("grouping", () => {
		it("SHOULD group the calls of one endpoint whatever their numbers and query strings", () => {
			const timings = summarizeEndpointTimings(
				[
					entry("/api/backlog/user-versions/1", 10, { method: "PATCH" }),
					entry("/api/backlog/user-versions/2?x=1", 30, { method: "PATCH" }),
				],
				10,
			);

			expect(timings).toStrictEqual([
				{
					endpoint: "PATCH /api/backlog/user-versions/:id",
					requestCount: 2,
					medianMs: 10,
					p95Ms: 30,
					maxMs: 30,
				},
			]);
		});

		it("SHOULD tell two methods of the same path apart", () => {
			const timings = summarizeEndpointTimings(
				[
					entry("/api/backlog/user-games", 10),
					entry("/api/backlog/user-games", 20, { method: "POST" }),
				],
				10,
			);

			expect(timings.map(({ endpoint }) => endpoint).toSorted()).toStrictEqual([
				"GET /api/backlog/user-games",
				"POST /api/backlog/user-games",
			]);
		});
	});

	describe("percentiles", () => {
		it("SHOULD give the median, the 95th percentile and the maximum", () => {
			const durations = Array.from({ length: 20 }, (_, index) => index + 1);

			const [timing] = summarizeEndpointTimings(
				durations.map((duration) => entry("/api/health", duration)),
				10,
			);

			expect(timing).toMatchObject({
				requestCount: 20,
				medianMs: 10,
				p95Ms: 19,
				maxMs: 20,
			});
		});
	});

	describe("ranking", () => {
		it("SHOULD put the slowest endpoint first and keep only the limit", () => {
			const timings = summarizeEndpointTimings(
				[
					entry("/api/fast", 5),
					entry("/api/slow", 900),
					entry("/api/middle", 80),
				],
				2,
			);

			expect(timings.map(({ endpoint }) => endpoint)).toStrictEqual([
				"GET /api/slow",
				"GET /api/middle",
			]);
		});
	});

	describe("ignored requests", () => {
		it("SHOULD ignore pages, Jellyfin, scans answered 404 and lines without duration", () => {
			const timings = summarizeEndpointTimings(
				[
					entry("/backlog", 50),
					entry("/api/games", 50, { host: "jellyfin.alexandre-richard.fr" }),
					entry("/api/wp-admin", 5, { status: 404 }),
					entry("/api/health", null),
				],
				10,
			);

			expect(timings).toStrictEqual([]);
		});
	});
});
