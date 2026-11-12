import { describe, expect, it } from "vitest";

import { getRowKeyAction } from "./getRowKeyAction";

describe("getRowKeyAction.ts", () => {
	describe("moving between rows", () => {
		it("SHOULD go to the previous row WHEN the key is the up arrow", () => {
			expect(getRowKeyAction("ArrowUp", false)).toBe("previousRow");
		});

		it("SHOULD go to the next row WHEN the key is the down arrow", () => {
			expect(getRowKeyAction("ArrowDown", false)).toBe("nextRow");
		});
	});

	describe("expanding", () => {
		it("SHOULD toggle the row WHEN the key is Enter and the row has several played versions", () => {
			expect(getRowKeyAction("Enter", true)).toBe("toggleExpanded");
		});

		it("SHOULD do nothing WHEN the key is Enter and the row has nothing to expand", () => {
			expect(getRowKeyAction("Enter", false)).toBeNull();
		});
	});

	describe("removing", () => {
		it("SHOULD remove WHEN the key is Delete", () => {
			expect(getRowKeyAction("Delete", false)).toBe("remove");
		});
	});

	describe("other keys", () => {
		it("SHOULD do nothing", () => {
			expect(getRowKeyAction("a", true)).toBeNull();
		});
	});
});
