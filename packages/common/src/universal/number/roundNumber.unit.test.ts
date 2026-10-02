import { describe, expect, it } from "vitest";

import { roundNumber } from "./roundNumber.ts";

describe("roundNumber.ts", () => {
	describe("nearest rounding", () => {
		it("SHOULD round to the given number of decimals", () => {
			expect(roundNumber(3.14159, 2)).toBe(3.14);
			expect(roundNumber(2.71828, 3)).toBe(2.718);
		});

		it("SHOULD round to an integer WHEN decimals is 0", () => {
			expect(roundNumber(1234.6, 0)).toBe(1235);
		});

		it("SHOULD round a half away from zero", () => {
			expect(roundNumber(2.5, 0)).toBe(3);
			expect(roundNumber(-2.5, 0)).toBe(-3);
		});

		it("SHOULD round up a half WHEN its binary value is slightly below it", () => {
			// 1.005 vaut 1.00499999999999989… en mémoire : toFixed(2) donne "1.00"
			expect(roundNumber(1.005, 2)).toBe(1.01);
		});

		it("SHOULD not add decimals WHEN the number has fewer", () => {
			expect(roundNumber(1.5, 3)).toBe(1.5);
		});
	});

	describe("ceil and floor", () => {
		it("SHOULD round up WHEN the type is ceil", () => {
			expect(roundNumber(1.231, 2, "ceil")).toBe(1.24);
			expect(roundNumber(-1.239, 2, "ceil")).toBe(-1.23);
		});

		it("SHOULD round down WHEN the type is floor", () => {
			expect(roundNumber(1.239, 2, "floor")).toBe(1.23);
			expect(roundNumber(-1.231, 2, "floor")).toBe(-1.24);
		});

		it("SHOULD not move a number that already has the right decimals", () => {
			// 1.1 * 100 vaut 110.00000000000001 : un Math.ceil direct donnerait 1.11
			expect(roundNumber(1.1, 2, "ceil")).toBe(1.1);
			expect(roundNumber(4.35, 2, "floor")).toBe(4.35);
		});
	});

	describe("special numbers", () => {
		it("SHOULD handle numbers written in exponent notation", () => {
			expect(roundNumber(1.23456e-7, 9)).toBe(1.23e-7);
			expect(roundNumber(1.5e21, 0)).toBe(1.5e21);
		});

		it("SHOULD return 0 and not -0 WHEN a small negative number rounds to zero", () => {
			expect(Object.is(roundNumber(-0.001, 2), 0)).toBe(true);
		});

		it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
			"SHOULD return the number unchanged WHEN it is %o",
			(number) => {
				expect(roundNumber(number, 2)).toBe(number);
			},
		);
	});
});
