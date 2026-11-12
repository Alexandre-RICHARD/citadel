import { describe, expect, it } from "vitest";

import { getTwoButtonsNeighbor } from "./getTwoButtonsNeighbor";

const cancel = document.createElement("button");
const confirm = document.createElement("button");

describe("getTwoButtonsNeighbor.ts", () => {
	describe("two buttons", () => {
		it("SHOULD give the first button WHEN the key is ←", () => {
			expect(getTwoButtonsNeighbor([cancel, confirm], "ArrowLeft")).toBe(
				cancel,
			);
		});

		it("SHOULD give the second button WHEN the key is →", () => {
			expect(getTwoButtonsNeighbor([cancel, confirm], "ArrowRight")).toBe(
				confirm,
			);
		});

		it("SHOULD give null WHEN the key is not a horizontal arrow", () => {
			expect(getTwoButtonsNeighbor([cancel, confirm], "ArrowDown")).toBeNull();
		});
	});

	describe("other counts", () => {
		it("SHOULD give null WHEN there is a single button", () => {
			expect(getTwoButtonsNeighbor([cancel], "ArrowRight")).toBeNull();
		});

		it("SHOULD give null WHEN there are three buttons", () => {
			expect(
				getTwoButtonsNeighbor([cancel, confirm, cancel], "ArrowRight"),
			).toBeNull();
		});
	});
});
