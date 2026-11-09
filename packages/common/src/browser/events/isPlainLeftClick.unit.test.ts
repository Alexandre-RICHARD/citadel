import { describe, expect, it } from "vitest";

import { isPlainLeftClick } from "./isPlainLeftClick.ts";

const plainClick = {
	button: 0,
	ctrlKey: false,
	metaKey: false,
	shiftKey: false,
	altKey: false,
	defaultPrevented: false,
};

describe("isPlainLeftClick.ts", () => {
	describe("plain click", () => {
		it("SHOULD be true WHEN it is a left click without modifier", () => {
			expect(isPlainLeftClick(plainClick)).toBe(true);
		});
	});

	describe("click left to the browser", () => {
		it.each([1, 2])("SHOULD be false WHEN the button is %i", (button) => {
			expect(isPlainLeftClick({ ...plainClick, button })).toBe(false);
		});

		it.each(["ctrlKey", "metaKey", "shiftKey", "altKey"] as const)(
			"SHOULD be false WHEN %s is held",
			(modifier) => {
				expect(isPlainLeftClick({ ...plainClick, [modifier]: true })).toBe(
					false,
				);
			},
		);

		it("SHOULD be false WHEN the click was already handled", () => {
			expect(isPlainLeftClick({ ...plainClick, defaultPrevented: true })).toBe(
				false,
			);
		});
	});
});
