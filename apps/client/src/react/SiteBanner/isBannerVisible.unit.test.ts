import { describe, expect, it } from "vitest";

import { isBannerVisible } from "./isBannerVisible";

const NOW = Date.parse("2026-11-01T12:00:00Z");
const BANNER = {
	id: "1793538393",
	kind: "message" as const,
	message: "Site en maintenance ce soir",
	endsAt: null,
};

describe("isBannerVisible.ts", () => {
	describe("display", () => {
		it("SHOULD show the banner WHEN it has no end date and was never closed", () => {
			expect(isBannerVisible(BANNER, null, NOW)).toBe(true);
		});

		it("SHOULD hide the banner WHEN it was closed", () => {
			expect(isBannerVisible(BANNER, "1793538393", NOW)).toBe(false);
		});

		it("SHOULD show a new banner WHEN an older one was closed", () => {
			expect(isBannerVisible(BANNER, "1700000000", NOW)).toBe(true);
		});

		it("SHOULD hide the banner WHEN its end date is past", () => {
			expect(
				isBannerVisible(
					{ ...BANNER, endsAt: "2026-10-31T23:59:59+01:00" },
					null,
					NOW,
				),
			).toBe(false);
		});

		it("SHOULD hide everything WHEN there is no banner", () => {
			expect(isBannerVisible(null, null, NOW)).toBe(false);
		});
	});
});
