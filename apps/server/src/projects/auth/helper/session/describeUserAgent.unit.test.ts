import { describe, expect, it } from "vitest";

import { describeUserAgent } from "./describeUserAgent.ts";

describe("describeUserAgent.ts", () => {
	describe("known user agents", () => {
		it.each([
			{
				reason: "Chrome on Windows",
				userAgent:
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
				expected: { browser: "Chrome", system: "Windows" },
			},
			{
				reason: "Edge on Windows",
				userAgent:
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
				expected: { browser: "Edge", system: "Windows" },
			},
			{
				reason: "Firefox on Linux",
				userAgent:
					"Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
				expected: { browser: "Firefox", system: "Linux" },
			},
			{
				reason: "Safari on macOS",
				userAgent:
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
				expected: { browser: "Safari", system: "macOS" },
			},
			{
				reason: "Safari on an iPhone (which also says Mac OS X)",
				userAgent:
					"Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
				expected: { browser: "Safari", system: "iOS" },
			},
			{
				reason: "Chrome on Android (which also says Linux)",
				userAgent:
					"Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
				expected: { browser: "Chrome", system: "Android" },
			},
		])(
			"SHOULD name the browser and the system of $reason",
			({ userAgent, expected }) => {
				expect(describeUserAgent(userAgent)).toStrictEqual(expected);
			},
		);
	});

	describe("unknown user agents", () => {
		it("SHOULD name nothing WHEN there is no user agent", () => {
			expect(describeUserAgent(null)).toStrictEqual({
				browser: null,
				system: null,
			});
		});

		it("SHOULD name nothing WHEN the user agent is not recognised", () => {
			expect(describeUserAgent("Vitest")).toStrictEqual({
				browser: null,
				system: null,
			});
		});
	});
});
