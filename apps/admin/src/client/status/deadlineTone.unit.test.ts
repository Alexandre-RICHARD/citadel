import { describe, expect, it } from "vitest";

import { deadlineTone } from "./deadlineTone";

const NOW = Date.parse("2026-10-25T12:00:00Z");

function expiringIn(days: number) {
	return {
		label: "Certificat",
		expiresAt: new Date(NOW + days * 86_400_000).toISOString(),
		problem: null,
	};
}

function usingPercent(percent: number) {
	return {
		label: "Quota du Drive",
		expiresAt: null,
		problem: null,
		usage: { usedBytes: percent, totalBytes: 100 },
	};
}

describe("deadlineTone.ts", () => {
	describe("usage", () => {
		it("SHOULD be ok WHEN less than 80 % is used", () => {
			expect(deadlineTone(usingPercent(40), NOW)).toBe("ok");
		});

		it("SHOULD warn WHEN 80 % or more is used", () => {
			expect(deadlineTone(usingPercent(85), NOW)).toBe("warn");
		});

		it("SHOULD be danger WHEN 95 % or more is used", () => {
			expect(deadlineTone(usingPercent(97), NOW)).toBe("danger");
		});
	});

	describe("dates", () => {
		it("SHOULD be ok WHEN more than two weeks are left", () => {
			expect(deadlineTone(expiringIn(40), NOW)).toBe("ok");
		});

		it("SHOULD warn WHEN less than two weeks are left", () => {
			expect(deadlineTone(expiringIn(10), NOW)).toBe("warn");
		});

		it("SHOULD be danger WHEN less than a week is left", () => {
			expect(deadlineTone(expiringIn(3), NOW)).toBe("danger");
		});

		it("SHOULD be ok WHEN the item never expires", () => {
			expect(
				deadlineTone({ label: "Clé", expiresAt: null, problem: null }, NOW),
			).toBe("ok");
		});
	});

	describe("problems", () => {
		it("SHOULD be danger WHEN the date could not be read", () => {
			expect(
				deadlineTone(
					{ label: "Token", expiresAt: null, problem: "refusé" },
					NOW,
				),
			).toBe("danger");
		});
	});
});
