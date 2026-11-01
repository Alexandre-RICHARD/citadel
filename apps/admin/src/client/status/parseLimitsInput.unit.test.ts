import { describe, expect, it } from "vitest";

import { parseLimitsInput } from "./parseLimitsInput";

const CURRENT = { memoryLimitBytes: 512 * 1024 ** 2, cpuLimit: 1 };

describe("parseLimitsInput.ts", () => {
	describe("changes", () => {
		it("SHOULD convert mebibytes and accept a decimal comma WHEN both fields change", () => {
			expect(parseLimitsInput("768", "1,5", CURRENT)).toEqual({
				memoryBytes: 768 * 1024 ** 2,
				cpus: 1.5,
			});
		});

		it("SHOULD keep a field unchanged WHEN it holds the current value or nothing", () => {
			expect(parseLimitsInput("512", "", CURRENT)).toBe("Rien à changer");
			expect(parseLimitsInput("512", "2", CURRENT)).toEqual({
				memoryBytes: null,
				cpus: 2,
			});
		});

		it("SHOULD round the processor to two decimals WHEN given more", () => {
			expect(parseLimitsInput("", "0.333", CURRENT)).toEqual({
				memoryBytes: null,
				cpus: 0.33,
			});
		});
	});

	describe("errors", () => {
		it.each([
			["abc", "1", "Un nombre attendu"],
			["32", "1", "Mémoire : un nombre entier de Mio, 64 au moins"],
			["100,5", "1", "Mémoire : un nombre entier de Mio, 64 au moins"],
			["512", "0.05", "Processeur : entre 0,1 et 99 cœurs"],
		])(
			"SHOULD refuse WHEN the memory is %s and the processor %s",
			(memory, cpus, expected) => {
				expect(parseLimitsInput(memory, cpus, CURRENT)).toBe(expected);
			},
		);
	});
});
