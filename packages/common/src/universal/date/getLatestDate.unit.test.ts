import { describe, expect, it } from "vitest";

import { getLatestDate } from "./getLatestDate.ts";

const firstDeath = new Date("2019-03-30T22:10:00.000Z");
const middleDeath = new Date("2019-03-30T22:25:00.000Z");
const lastDeath = new Date("2019-04-01T08:00:00.000Z");

describe("getLatestDate.ts", () => {
	describe("existing dates", () => {
		it("SHOULD return the last date WHEN the dates are not sorted", () => {
			expect(getLatestDate([middleDeath, lastDeath, firstDeath])).toBe(
				lastDeath,
			);
		});

		it("SHOULD ignore the null values", () => {
			expect(getLatestDate([null, middleDeath, null, lastDeath])).toBe(
				lastDeath,
			);
		});

		it("SHOULD return the only date WHEN there is one", () => {
			expect(getLatestDate([middleDeath])).toBe(middleDeath);
		});

		it("SHOULD return the first instance WHEN two dates are equal", () => {
			const sameInstant = new Date(lastDeath);

			expect(getLatestDate([lastDeath, sameInstant])).toBe(lastDeath);
		});
	});

	describe("no date", () => {
		it("SHOULD return null WHEN the array is empty", () => {
			expect(getLatestDate([])).toBeNull();
		});

		it("SHOULD return null WHEN every value is null", () => {
			expect(getLatestDate([null, null])).toBeNull();
		});
	});
});
