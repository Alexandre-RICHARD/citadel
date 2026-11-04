import { describe, expect, it } from "vitest";

import { buildRecoveryCodesFile } from "./buildRecoveryCodesFile";

const DATE = new Date("2026-11-04T09:30:00.000Z");

describe("buildRecoveryCodesFile.ts", () => {
	describe("content", () => {
		it("SHOULD list one code per line after the account and the date", () => {
			const lines = buildRecoveryCodesFile({
				codes: ["ABCDE-FGHIJ", "KLMNO-PQRST"],
				email: "alex@example.com",
				date: DATE,
			}).split("\n");

			expect(lines).toContain("Compte : alex@example.com");
			expect(lines).toContain("Créés le : 2026-11-04");
			expect(lines).toContain("ABCDE-FGHIJ");
			expect(lines).toContain("KLMNO-PQRST");
			expect(lines.indexOf("ABCDE-FGHIJ") + 1).toBe(
				lines.indexOf("KLMNO-PQRST"),
			);
		});

		it("SHOULD end with a line break", () => {
			expect(
				buildRecoveryCodesFile({
					codes: ["ABCDE-FGHIJ"],
					email: "a@b.c",
					date: DATE,
				}),
			).toMatch(/ABCDE-FGHIJ\n$/u);
		});
	});
});
