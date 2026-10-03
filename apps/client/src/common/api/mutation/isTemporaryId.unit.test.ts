import { describe, expect, it } from "vitest";

import { createTemporaryId } from "./createTemporaryId";
import { isTemporaryId } from "./isTemporaryId";

describe("isTemporaryId.ts", () => {
	describe("detection", () => {
		it("SHOULD recognize an id WHEN it comes from createTemporaryId", () => {
			expect(isTemporaryId(createTemporaryId())).toBe(true);
		});

		it("SHOULD not flag an id WHEN it comes from the server", () => {
			expect(isTemporaryId(42)).toBe(false);
		});
	});
});
