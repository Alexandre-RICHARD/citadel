import { externalLinks } from "@citadel/specs/src/links/externalLinks";
import { describe, expect, it } from "vitest";

import { getIgdbImageUrl } from "./getIgdbImageUrl";
import { IgdbImageSizeEnum } from "./igdbImageSize.enum";

describe("getIgdbImageUrl.ts", () => {
	describe("density", () => {
		it("SHOULD build the URL of the image at the given size", () => {
			expect(getIgdbImageUrl("co1tnw", IgdbImageSizeEnum.COVER_SMALL)).toBe(
				`${externalLinks.igdbImages}/t_cover_small/co1tnw.jpg`,
			);
		});

		it("SHOULD ask for the double size WHEN the screen is high density", () => {
			expect(getIgdbImageUrl("co1tnw", IgdbImageSizeEnum.THUMB, true)).toBe(
				`${externalLinks.igdbImages}/t_thumb_2x/co1tnw.jpg`,
			);
		});
	});
});
