import { describe, expect, it } from "vitest";

import { writeCountdown } from "./writeCountdown";

describe("writeCountdown", () => {
	describe("format: HMS", () => {
		it("SHOULD return raw units WHEN time is simple", () => {
			expect(writeCountdown(3910000, "HMS")).toBe("1H 5M 10S");
		});

		it("SHOULD return zero for all units WHEN time is 0", () => {
			expect(writeCountdown(0, "HMS")).toBe("0H 0M 0S");
		});

		it("SHOULD not have leading zeros WHEN units are single digits", () => {
			expect(writeCountdown(3661000, "HMS")).toBe("1H 1M 1S");
		});
	});

	describe("format: HHMMSS", () => {
		it("SHOULD return padded units WHEN units are single digits", () => {
			expect(writeCountdown(3661000, "HHMMSS")).toBe("01H 01M 01S");
		});

		it("SHOULD keep three digits WHEN hours exceed 99", () => {
			expect(writeCountdown(3600000 * 150, "HHMMSS")).toBe("150H 00M 00S");
		});
	});

	describe("edge cases", () => {
		it("SHOULD truncate decimal values WHEN milliseconds are provided", () => {
			expect(writeCountdown(1500.99, "HMS")).toBe("0H 0M 1S");
		});

		it("SHOULD return an empty string WHEN format is invalid", () => {
			// @ts-expect-error : Test if type is wrong
			expect(writeCountdown(1000, "INVALID")).toBe("");
		});
	});
});
