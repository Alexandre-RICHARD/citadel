import { describe, expect, it } from "vitest";

import { buildRecoveryCodesFileName } from "./buildRecoveryCodesFileName";

describe("buildRecoveryCodesFileName.ts", () => {
	describe("file name", () => {
		it("SHOULD carry the creation day", () => {
			expect(
				buildRecoveryCodesFileName(new Date("2026-11-04T09:30:00.000Z")),
			).toBe("citadel-codes-de-secours-2026-11-04.txt");
		});
	});
});
