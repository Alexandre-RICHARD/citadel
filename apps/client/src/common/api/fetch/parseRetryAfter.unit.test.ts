import { describe, expect, it } from "vitest";

import { parseRetryAfter } from "./parseRetryAfter";

const NOW = Date.parse("2026-11-01T12:00:00Z");

describe("parseRetryAfter.ts", () => {
	describe("delay", () => {
		it("SHOULD return the seconds WHEN the header is a delay", () => {
			expect(parseRetryAfter("120", NOW)).toBe(120);
		});

		it("SHOULD ignore the surrounding spaces WHEN the header has some", () => {
			expect(parseRetryAfter(" 30 ", NOW)).toBe(30);
		});
	});

	describe("date", () => {
		it("SHOULD return the seconds until the date WHEN the header is an HTTP date", () => {
			expect(parseRetryAfter("Sun, 01 Nov 2026 12:01:30 GMT", NOW)).toBe(90);
		});

		it("SHOULD return zero WHEN the date is past", () => {
			expect(parseRetryAfter("Sun, 01 Nov 2026 11:00:00 GMT", NOW)).toBe(0);
		});
	});

	describe("missing", () => {
		it.each([
			{ reason: "absent", header: null },
			{ reason: "unreadable", header: "soon" },
			{ reason: "a negative delay", header: "-5" },
		])("SHOULD return null WHEN the header is $reason", ({ header }) => {
			expect(parseRetryAfter(header, NOW)).toBeNull();
		});
	});
});
