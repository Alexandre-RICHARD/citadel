import { describe, expect, it } from "vitest";

import { isTextField } from "./isTextField.ts";

function createInput(type: string): HTMLInputElement {
	const input = document.createElement("input");
	input.type = type;
	return input;
}

describe("isTextField.ts", () => {
	describe("text fields", () => {
		it.each(["text", "email", "number", "date", "search"])(
			"SHOULD return true WHEN the input type is %s",
			(type) => {
				expect(isTextField(createInput(type))).toBe(true);
			},
		);

		it("SHOULD return true WHEN the element is a textarea", () => {
			expect(isTextField(document.createElement("textarea"))).toBe(true);
		});
	});

	describe("other targets", () => {
		it.each(["checkbox", "radio", "button"])(
			"SHOULD return false WHEN the input type is %s",
			(type) => {
				expect(isTextField(createInput(type))).toBe(false);
			},
		);

		it("SHOULD return false WHEN the element is not a field", () => {
			expect(isTextField(document.createElement("div"))).toBe(false);
		});

		it("SHOULD return false WHEN there is no target", () => {
			expect(isTextField(null)).toBe(false);
		});
	});
});
