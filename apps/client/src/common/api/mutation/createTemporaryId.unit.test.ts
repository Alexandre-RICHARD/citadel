import { describe, expect, it } from "vitest";

import { createTemporaryId } from "./createTemporaryId";

describe("createTemporaryId.ts", () => {
	describe("generated ids", () => {
		it("SHOULD give a negative id, that no server id can match", () => {
			expect(createTemporaryId()).toBeLessThan(0);
		});

		it("SHOULD give a new id WHEN called again", () => {
			const firstId = createTemporaryId();
			const secondId = createTemporaryId();

			expect(secondId).not.toBe(firstId);
		});
	});
});
