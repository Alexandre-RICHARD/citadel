import { describe, expect, it } from "vitest";

import { escapeHtml } from "./escapeHtml.ts";

describe("escapeHtml.ts", () => {
	describe("escaping", () => {
		it("SHOULD neutralise the tags WHEN the text contains some", () => {
			expect(escapeHtml('<a href="x">Clique</a>')).toBe(
				"&lt;a href=&quot;x&quot;&gt;Clique&lt;/a&gt;",
			);
		});

		it("SHOULD escape the ampersands and apostrophes WHEN the text contains some", () => {
			expect(escapeHtml("Tom & Jerry, l'été")).toBe(
				"Tom &amp; Jerry, l&#39;été",
			);
		});

		it("SHOULD leave the text untouched WHEN it has nothing to escape", () => {
			expect(escapeHtml("Bonjour !")).toBe("Bonjour !");
		});
	});
});
