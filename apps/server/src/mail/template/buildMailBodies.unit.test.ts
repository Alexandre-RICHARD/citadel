import { describe, expect, it } from "vitest";

import { buildMailBodies } from "./buildMailBodies.ts";

describe("buildMailBodies.ts", () => {
	describe("text", () => {
		it("SHOULD separate the paragraphs and end with the note WHEN there is one", () => {
			const { text } = buildMailBodies({
				paragraphs: ["Bonjour,", "Merci."],
				note: "Une seule fois par jour.",
			});

			expect(text).toBe("Bonjour,\n\nMerci.\n\nUne seule fois par jour.");
		});
	});

	describe("html", () => {
		it("SHOULD escape the text and keep its line breaks WHEN a paragraph has some", () => {
			const { html } = buildMailBodies({
				paragraphs: ["<b>Salut</b>\nça va ?"],
				note: null,
			});

			expect(html).toContain("&lt;b&gt;Salut&lt;/b&gt;<br>ça va ?");
			expect(html).not.toContain("<b>");
		});

		it("SHOULD write the note in grey WHEN there is one", () => {
			const { html } = buildMailBodies({
				paragraphs: ["Bonjour,"],
				note: "Note",
			});

			expect(html).toContain('color: #666; font-size: 13px;">Note</p>');
		});
	});
});
