import { describe, expect, it } from "vitest";

import { parseRunTimeMinutes } from "./parseRunTimeMinutes.ts";

describe("parseRunTimeMinutes.ts", () => {
	describe("readable", () => {
		it("SHOULD read hours, minutes and seconds", () => {
			expect(parseRunTimeMinutes("1:52:30")).toBe(112.5);
			expect(parseRunTimeMinutes("52:30")).toBe(52.5);
		});
	});

	describe("unreadable", () => {
		it("SHOULD give nothing", () => {
			expect(parseRunTimeMinutes("")).toBeNull();
			expect(parseRunTimeMinutes("abc")).toBeNull();
		});
	});
});
