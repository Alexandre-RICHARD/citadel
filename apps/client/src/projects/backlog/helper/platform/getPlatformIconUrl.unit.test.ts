import { describe, expect, it } from "vitest";

import { getPlatformIconUrl } from "./getPlatformIconUrl";

const ICON_URLS = {
	"../../icons/ps2.svg": "/assets/ps2.svg",
	"../../icons/steam.svg": "/assets/steam.svg",
};

describe("getPlatformIconUrl.ts", () => {
	describe("icon provided", () => {
		it.each([
			{ technicalName: "ps2", url: "/assets/ps2.svg" },
			{ technicalName: "steam", url: "/assets/steam.svg" },
		])("SHOULD give the icon of $technicalName", ({ technicalName, url }) => {
			expect(getPlatformIconUrl(technicalName, ICON_URLS)).toBe(url);
		});
	});

	describe("icon missing", () => {
		it("SHOULD give null WHEN no SVG is named after the platform", () => {
			expect(getPlatformIconUrl("rpcs3", ICON_URLS)).toBeNull();
		});

		it("SHOULD give null WHEN there is no icon at all", () => {
			expect(getPlatformIconUrl("ps2", {})).toBeNull();
		});
	});
});
