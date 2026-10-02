import { describe, expect, it } from "vitest";

import { getEarliestDate } from "./getEarliestDate.ts";

const firstDeath = new Date("2019-03-30T22:10:00.000Z");
const middleDeath = new Date("2019-03-30T22:25:00.000Z");
const lastDeath = new Date("2019-04-01T08:00:00.000Z");

describe("getEarliestDate.ts", () => {
	describe("existing dates", () => {
		it("SHOULD return the first date WHEN the dates are not sorted", () => {
			expect(getEarliestDate([middleDeath, lastDeath, firstDeath])).toBe(
				firstDeath,
			);
		});

		it("SHOULD ignore the null values", () => {
			expect(getEarliestDate([null, middleDeath, null, firstDeath])).toBe(
				firstDeath,
			);
		});

		it("SHOULD return the only date WHEN there is one", () => {
			expect(getEarliestDate([middleDeath])).toBe(middleDeath);
		});

		it("SHOULD return the first instance WHEN two dates are equal", () => {
			const sameInstant = new Date(firstDeath);

			expect(getEarliestDate([firstDeath, sameInstant])).toBe(firstDeath);
		});
	});

	describe("no date", () => {
		it("SHOULD return null WHEN the array is empty", () => {
			expect(getEarliestDate([])).toBeNull();
		});

		it("SHOULD return null WHEN every value is null", () => {
			expect(getEarliestDate([null, null])).toBeNull();
		});
	});
});
