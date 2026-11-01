import { describe, expect, it } from "vitest";

import { nextCronRun } from "./nextCronRun.ts";

// Samedi 31 octobre 2026, 10 h 07, heure locale
const FROM = new Date(2026, 9, 31, 10, 7, 30);

describe("nextCronRun.ts", () => {
	describe("schedules", () => {
		it("SHOULD give the next multiple of 5 minutes WHEN the line runs every 5 minutes", () => {
			expect(nextCronRun("*/5 * * * *", FROM)).toEqual(
				new Date(2026, 9, 31, 10, 10),
			);
		});

		it("SHOULD give tomorrow at 5:00 WHEN today's 5:00 is past", () => {
			expect(nextCronRun("0 5 * * *", FROM)).toEqual(
				new Date(2026, 10, 1, 5, 0),
			);
		});

		it("SHOULD give the next Monday WHEN the line runs on day 1 of the week", () => {
			expect(nextCronRun("0 3 * * 1", FROM)).toEqual(
				new Date(2026, 10, 2, 3, 0),
			);
		});

		it("SHOULD treat 7 as Sunday WHEN the week day is written 7", () => {
			expect(nextCronRun("30 8 * * 7", FROM)).toEqual(
				new Date(2026, 10, 1, 8, 30),
			);
		});

		it("SHOULD never return the starting minute WHEN it matches", () => {
			expect(nextCronRun("7 10 * * *", FROM)).toEqual(
				new Date(2026, 10, 1, 10, 7),
			);
		});

		it("SHOULD read lists and ranges WHEN the fields use them", () => {
			expect(nextCronRun("0 9-11,20 * * *", FROM)).toEqual(
				new Date(2026, 9, 31, 11, 0),
			);
		});
	});

	describe("invalid lines", () => {
		it("SHOULD return null WHEN a field is out of range", () => {
			expect(nextCronRun("61 * * * *", FROM)).toBeNull();
		});

		it("SHOULD return null WHEN the line does not have 5 fields", () => {
			expect(nextCronRun("@daily", FROM)).toBeNull();
		});
	});
});
