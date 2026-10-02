import { describe, expect, it } from "vitest";

import { objectEntriesToArray } from "./objectEntriesToArray.ts";

describe("objectEntriesToArray.ts", () => {
	describe("conversion", () => {
		it("SHOULD keep only the values, in order", () => {
			expect(
				objectEntriesToArray(Object.entries({ b: 2, a: 1 })),
			).toStrictEqual([2, 1]);
		});

		it("SHOULD return an empty array WHEN there is no entry", () => {
			expect(objectEntriesToArray([])).toStrictEqual([]);
		});
	});
});
