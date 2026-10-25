import { describe, expect, it } from "vitest";

import { parseDependsOn } from "./parseDependsOn.ts";

describe("parseDependsOn.ts", () => {
	describe("compose label", () => {
		it("SHOULD read each dependency and its condition WHEN the label lists several", () => {
			expect(
				parseDependsOn(
					"media-gluetun:service_healthy:true,media-radarr:service_started:false",
				),
			).toEqual([
				{ name: "media-gluetun", waitHealthy: true },
				{ name: "media-radarr", waitHealthy: false },
			]);
		});

		it("SHOULD return no dependency WHEN the label is missing or empty", () => {
			expect(parseDependsOn(undefined)).toEqual([]);
			expect(parseDependsOn("")).toEqual([]);
		});
	});
});
