import { describe, expect, it } from "vitest";

import { describeSessionDevice } from "./describeSessionDevice";

describe("describeSessionDevice.ts", () => {
	describe("known device", () => {
		it("SHOULD name the browser and the system WHEN both are known", () => {
			expect(describeSessionDevice("Firefox", "Windows")).toBe(
				"Firefox sur Windows",
			);
		});

		it.each([
			{ browser: "Firefox", system: null, expected: "Firefox" },
			{ browser: null, system: "Android", expected: "Android" },
		])(
			"SHOULD name only $expected WHEN the other one is unknown",
			({ browser, system, expected }) => {
				expect(describeSessionDevice(browser, system)).toBe(expected);
			},
		);
	});

	describe("unknown device", () => {
		it("SHOULD say so WHEN nothing is known", () => {
			expect(describeSessionDevice(null, null)).toBe("Appareil inconnu");
		});
	});
});
