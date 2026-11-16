import { describe, expect, it } from "vitest";

import { createTrackerNamer } from "./createTrackerNamer.ts";

const nameTracker = createTrackerNamer([
	{
		name: "Tracker A",
		urls: ["https://a.example/announce/secret", "https://a2.example/x"],
	},
]);

describe("createTrackerNamer.ts", () => {
	describe("known tracker", () => {
		it("SHOULD name each of its addresses, whatever the key", () => {
			expect(nameTracker("https://a2.example/announce/other")).toStrictEqual({
				name: "Tracker A",
				label: "Tracker A",
			});
		});
	});

	describe("unknown tracker", () => {
		it("SHOULD give its host only", () => {
			expect(nameTracker("https://b.example/announce/secret")).toStrictEqual({
				name: null,
				label: "b.example",
			});
		});
	});
});
