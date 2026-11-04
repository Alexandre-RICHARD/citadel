import { describe, expect, it } from "vitest";

import { buildQrCodePath } from "./buildQrCodePath";

describe("buildQrCodePath.ts", () => {
	describe("path", () => {
		it("SHOULD draw one unit square per dark module, at its column and row", () => {
			expect(
				buildQrCodePath([
					[true, false],
					[false, true],
				]),
			).toBe("M0 0h1v1h-1zM1 1h1v1h-1z");
		});

		it("SHOULD draw nothing WHEN every module is light", () => {
			expect(buildQrCodePath([[false, false]])).toBe("");
		});

		it("SHOULD draw nothing WHEN there is no module", () => {
			expect(buildQrCodePath([])).toBe("");
		});
	});
});
