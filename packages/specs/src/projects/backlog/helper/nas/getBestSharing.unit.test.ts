import { describe, expect, it } from "vitest";

import { NasSharingEnum } from "../../enum/nasSharing.enum.ts";
import { getBestSharing } from "./getBestSharing.ts";

describe("getBestSharing.ts", () => {
	describe("best state", () => {
		it("SHOULD keep seeding WHEN another torrent of the file is dead", () => {
			expect(
				getBestSharing([NasSharingEnum.ERROR, NasSharingEnum.SEEDING]),
			).toBe(NasSharingEnum.SEEDING);
		});

		it("SHOULD prefer an unreachable tracker to a dead torrent", () => {
			expect(
				getBestSharing([
					NasSharingEnum.ERROR,
					NasSharingEnum.TRACKER_UNREACHABLE,
				]),
			).toBe(NasSharingEnum.TRACKER_UNREACHABLE);
		});
	});

	describe("nothing to share", () => {
		it("SHOULD say not present WHEN there is no torrent", () => {
			expect(getBestSharing([])).toBe(NasSharingEnum.NONE);
		});
	});
});
