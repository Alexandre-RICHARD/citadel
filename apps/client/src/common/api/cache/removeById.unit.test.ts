import { describe, expect, it } from "vitest";

import { removeById } from "./removeById";

describe("removeById.ts", () => {
	describe("removal", () => {
		it("SHOULD keep every item but the one with the id", () => {
			expect(removeById([{ id: 1 }, { id: 2 }, { id: 3 }], 2)).toStrictEqual([
				{ id: 1 },
				{ id: 3 },
			]);
		});
	});
});
