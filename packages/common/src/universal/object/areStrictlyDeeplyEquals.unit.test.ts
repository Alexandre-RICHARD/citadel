import { describe, expect, it } from "vitest";

import { areStrictlyDeeplyEquals } from "./areStrictlyDeeplyEquals.ts";

describe("areStrictlyDeeplyEquals.ts", () => {
	describe("equal values", () => {
		it("SHOULD return true WHEN the primitives are strictly equal", () => {
			expect(areStrictlyDeeplyEquals<unknown>("Celeste", "Celeste")).toBe(true);
			expect(areStrictlyDeeplyEquals<unknown>(null, null)).toBe(true);
		});

		it("SHOULD return true WHEN nested objects and arrays have the same content", () => {
			expect(
				areStrictlyDeeplyEquals(
					{ name: "Cuphead", bosses: [{ name: "The Devil", deaths: 7 }] },
					{ bosses: [{ deaths: 7, name: "The Devil" }], name: "Cuphead" },
				),
			).toBe(true);
		});

		it("SHOULD return true WHEN two dates are the same instant", () => {
			expect(
				areStrictlyDeeplyEquals(
					new Date("2017-09-29T14:30:00.000Z"),
					new Date("2017-09-29T14:30:00.000Z"),
				),
			).toBe(true);
		});
	});

	describe("different values", () => {
		it("SHOULD not convert types", () => {
			expect(areStrictlyDeeplyEquals<unknown>(1, "1")).toBe(false);
			expect(areStrictlyDeeplyEquals<unknown>(null, undefined)).toBe(false);
		});

		it("SHOULD return false WHEN a nested value differs", () => {
			expect(
				areStrictlyDeeplyEquals({ a: { b: [1, 2] } }, { a: { b: [1, 3] } }),
			).toBe(false);
		});

		it("SHOULD return false WHEN the keys differ, even with undefined values", () => {
			expect(
				areStrictlyDeeplyEquals<object>(
					{ a: 1, b: undefined },
					{ a: 1, c: undefined },
				),
			).toBe(false);
			expect(areStrictlyDeeplyEquals<object>({ a: 1 }, { a: 1, b: 2 })).toBe(
				false,
			);
		});

		it("SHOULD return false WHEN the arrays have different lengths or orders", () => {
			expect(areStrictlyDeeplyEquals([1, 2], [1, 2, 3])).toBe(false);
			expect(areStrictlyDeeplyEquals([1, 2], [2, 1])).toBe(false);
		});

		it("SHOULD return false WHEN comparing an array with an object", () => {
			expect(areStrictlyDeeplyEquals<object>([1], { 0: 1 })).toBe(false);
		});

		it("SHOULD return false WHEN two dates are different instants", () => {
			expect(
				areStrictlyDeeplyEquals(
					new Date("2017-09-29T14:30:00.000Z"),
					new Date("2017-09-29T14:30:00.001Z"),
				),
			).toBe(false);
		});

		it("SHOULD return false WHEN comparing a date with an empty object", () => {
			expect(areStrictlyDeeplyEquals<object>(new Date(0), {})).toBe(false);
		});
	});
});
