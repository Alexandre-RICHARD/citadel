import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { pastIsoDateTimeSchema } from "./pastIsoDateTimeSchema.ts";
import { SqlDatetimeBoundEnum } from "./sqlDatetimeBound.enum.ts";

const schema = pastIsoDateTimeSchema("Date");

// Horloge figée : la limite « pas dans le futur » se teste à la milliseconde près
const NOW = "2025-06-15T12:00:00.000Z";

describe("pastIsoDateTimeSchema.ts", () => {
	beforeEach(() => {
		vi.useFakeTimers({ now: new Date(NOW) });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("accepted dates", () => {
		it.each([
			{
				reason: "a UTC date with milliseconds",
				date: "2024-05-30T21:45:00.123Z",
			},
			{
				reason: "a UTC date without fraction of second",
				date: "2024-05-30T21:45:00Z",
			},
			{
				reason: "a date with a single decimal",
				date: "2024-05-30T21:45:00.1Z",
			},
			{
				reason:
					"a date to the microsecond, truncated to the millisecond by the database",
				date: "2024-05-30T21:45:00.123456Z",
			},
			{
				reason: "a date with a time zone offset",
				date: "2024-05-30T23:45:00+02:00",
			},
			{
				reason: "a date with a negative offset",
				date: "2024-05-30T16:45:00-05:00",
			},
			{
				reason: "the largest time zone offset",
				date: "2024-01-01T10:00:00+14:00",
			},
			{ reason: "February 29th of a leap year", date: "2024-02-29T10:00:00Z" },
			{ reason: "now, to the millisecond", date: NOW },
			{
				reason: "the smallest date a DATETIME accepts",
				date: SqlDatetimeBoundEnum.MIN,
			},
		])("SHOULD accept the date unchanged WHEN it is $reason", ({ date }) => {
			expect(schema.safeParse(date)).toStrictEqual({
				success: true,
				data: date,
			});
		});
	});

	describe("rejected formats", () => {
		it.each([
			{ reason: "free text", value: "yesterday evening" },
			{ reason: "a date without time", value: "2024-01-01" },
			{ reason: "a date without time zone", value: "2024-01-01T10:00:00" },
			{ reason: "a time without seconds", value: "2024-01-01T10:00Z" },
			{ reason: "an offset without colon", value: "2024-01-01T10:00:00+0200" },
			{ reason: "February 30th", value: "2024-02-30T10:00:00Z" },
			{
				reason: "February 29th of a non-leap year",
				value: "2023-02-29T10:00:00Z",
			},
			{ reason: "a thirteenth month", value: "2024-13-01T10:00:00Z" },
			{ reason: "24 o'clock", value: "2024-01-01T24:00:00Z" },
			{ reason: "a six-digit year", value: "+002024-01-01T10:00:00Z" },
			{ reason: "an empty string", value: "" },
			{ reason: "a numeric timestamp", value: 1_700_000_000_000 },
			{ reason: "a Date object", value: new Date("2024-01-01T10:00:00Z") },
			{ reason: "null", value: null },
			{ reason: "undefined", value: undefined },
		])(
			"SHOULD ask for an ISO 8601 datetime WHEN the value is $reason",
			({ value }) => {
				expect(getIssues(schema.safeParse(value))).toStrictEqual([
					{ path: [], message: "Date should be an ISO 8601 datetime" },
				]);
			},
		);
	});

	describe("rejected future dates", () => {
		it.each([
			{
				reason: "one millisecond after now",
				value: "2025-06-15T12:00:00.001Z",
			},
			{
				reason: "one millisecond after now, in a time zone ahead",
				value: "2025-06-15T14:00:00.001+02:00",
			},
			{ reason: "far in the future", value: "2999-01-01T00:00:00.000Z" },
		])("SHOULD reject the date WHEN it is $reason", ({ value }) => {
			expect(getIssues(schema.safeParse(value))).toStrictEqual([
				{ path: [], message: "Date should not be in the future" },
			]);
		});
	});

	describe("rejected dates out of DATETIME range", () => {
		it.each([
			{
				reason: "one millisecond before year 1000",
				value: "0999-12-31T23:59:59.999Z",
			},
			{
				reason: "year 1, that the database would store as 2001",
				value: "0001-01-01T00:00:00.000Z",
			},
			{
				reason: "January 1st 1000 in local time, still year 999 in UTC",
				value: "1000-01-01T00:30:00.000+01:00",
			},
		])("SHOULD reject the date WHEN it is $reason", ({ value }) => {
			expect(getIssues(schema.safeParse(value))).toStrictEqual([
				{
					path: [],
					message: `Date should not be before ${SqlDatetimeBoundEnum.MIN}`,
				},
			]);
		});
	});
});
