import { describe, expect, it } from "vitest";

import { isOwnImage } from "./isOwnImage.ts";

describe("isOwnImage.ts", () => {
	describe("images", () => {
		it.each([
			"ghcr.io/alexandre-richard/citadel-server:v2026.11.01.01",
			"citadel-client:local",
		])("SHOULD count the image as ours WHEN it is %s", (image) => {
			expect(isOwnImage(image)).toBe(true);
		});

		it.each(["mariadb:11.8.9", "ghcr.io/cross-seed/cross-seed:6.13.9"])(
			"SHOULD count the image as third-party WHEN it is %s",
			(image) => {
				expect(isOwnImage(image)).toBe(false);
			},
		);
	});
});
