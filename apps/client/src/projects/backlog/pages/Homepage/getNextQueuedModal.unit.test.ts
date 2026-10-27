import { describe, expect, it } from "vitest";

import { getNextQueuedModal } from "./getNextQueuedModal";

describe("getNextQueuedModal.ts", () => {
	describe("queued DLCs", () => {
		it("SHOULD open the add modal of the next DLC and keep the rest queued", () => {
			expect(getNextQueuedModal([11, 12, 13])).toStrictEqual({
				kind: "addGame",
				igdbId: 11,
				queuedIgdbIds: [12, 13],
			});
		});
	});

	describe("empty queue", () => {
		it("SHOULD open no modal WHEN nothing is queued", () => {
			expect(getNextQueuedModal([])).toBeNull();
		});
	});
});
