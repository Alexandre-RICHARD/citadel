import { describe, expect, it } from "vitest";

import { insertAt } from "./insertAt";

describe("insertAt.ts", () => {
	describe("insertion", () => {
		it("SHOULD put the item back at its index", () => {
			expect(insertAt(["a", "c"], 1, "b")).toStrictEqual(["a", "b", "c"]);
		});

		it("SHOULD append the item WHEN the list became shorter than its index", () => {
			expect(insertAt(["a"], 5, "b")).toStrictEqual(["a", "b"]);
		});
	});
});
