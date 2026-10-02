import { describe, expect, it } from "vitest";

import { objectEntriesToObject } from "./objectEntriesToObject.ts";

describe("objectEntriesToObject.ts", () => {
	describe("conversion", () => {
		it("SHOULD build an object from the entries", () => {
			expect(
				objectEntriesToObject([
					["hollow", 1],
					["knight", 2],
				]),
			).toStrictEqual({ hollow: 1, knight: 2 });
		});

		it("SHOULD keep the last value WHEN a key is repeated", () => {
			expect(
				objectEntriesToObject([
					["key", 1],
					["key", 2],
				]),
			).toStrictEqual({ key: 2 });
		});

		it("SHOULD return an empty object WHEN there is no entry", () => {
			expect(objectEntriesToObject([])).toStrictEqual({});
		});
	});
});
