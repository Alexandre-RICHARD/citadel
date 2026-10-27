import { afterEach, describe, expect, it } from "vitest";

import { isEditingCell } from "./isEditingCell";

function focusIn(html: string, selector: string): void {
	document.body.innerHTML = html;
	document.querySelector<HTMLElement>(selector)?.focus();
}

describe("isEditingCell.ts", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	describe("focus", () => {
		it("SHOULD return true WHEN a text field of a table cell has the focus", () => {
			focusIn(
				"<table data-backlog-table><tbody><tr><td><input type='text' /></td></tr></tbody></table>",
				"input",
			);

			expect(isEditingCell()).toBe(true);
		});

		it("SHOULD return false WHEN the focused field is in the table header", () => {
			focusIn(
				"<table data-backlog-table><thead><tr><th><input type='text' /></th></tr></thead></table>",
				"input",
			);

			expect(isEditingCell()).toBe(false);
		});

		it("SHOULD return false WHEN the focused element of the cell is not a text field", () => {
			focusIn(
				"<table data-backlog-table><tbody><tr><td><button>…</button></td></tr></tbody></table>",
				"button",
			);

			expect(isEditingCell()).toBe(false);
		});

		it("SHOULD return false WHEN the focused field is outside the table", () => {
			focusIn("<input type='search' />", "input");

			expect(isEditingCell()).toBe(false);
		});
	});
});
