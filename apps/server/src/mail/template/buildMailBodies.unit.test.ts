import { describe, expect, it } from "vitest";

import { buildMailBodies } from "./buildMailBodies.ts";
import { MailAccentEnum } from "./mailAccent.enum.ts";
import type { MailLayout } from "./mailLayout.type.ts";

const LAYOUT: MailLayout = {
	preview: "Aperçu",
	accent: MailAccentEnum.MAGENTA,
	kicker: "Formulaire de contact",
	title: "Message bien reçu",
	lead: null,
	blocks: [
		{ kind: "paragraph", text: "Bonjour," },
		{ kind: "paragraph", text: "Merci." },
	],
	note: null,
};

describe("buildMailBodies.ts", () => {
	describe("text", () => {
		it("SHOULD start with the kicker and the underlined title, then separate the blocks", () => {
			const { text } = buildMailBodies(LAYOUT);

			expect(text).toMatch(
				/^Formulaire de contact\nMessage bien reçu\n=================\n\nBonjour,\n\nMerci\.\n\n/,
			);
		});

		it("SHOULD put the lead under the title and the note after a rule WHEN there are some", () => {
			const { text } = buildMailBodies({
				...LAYOUT,
				lead: "Merci de m'avoir écrit.",
				note: "Une seule fois par jour.",
			});

			expect(text).toContain("=\n\nMerci de m'avoir écrit.\n\nBonjour,");
			expect(text).toContain("Merci.\n\n---\nUne seule fois par jour.\n\n");
		});

		it("SHOULD end with the site name and address", () => {
			const { text } = buildMailBodies(LAYOUT);

			expect(text).toMatch(
				/La Citadel d'Alex · https:\/\/alexandre-richard\.fr$/,
			);
		});
	});

	describe("html", () => {
		it("SHOULD escape the text and keep its line breaks WHEN a block has some", () => {
			const { html } = buildMailBodies({
				...LAYOUT,
				blocks: [{ kind: "paragraph", text: "<b>Salut</b>\nça va ?" }],
			});

			expect(html).toContain("&lt;b&gt;Salut&lt;/b&gt;<br>ça va ?");
			expect(html).not.toContain("<b>");
		});

		it("SHOULD escape the title and the hidden preview WHEN they come from a visitor", () => {
			const { html } = buildMailBodies({
				...LAYOUT,
				preview: "<i>aperçu</i>",
				title: "<script>x</script>",
			});

			expect(html).toContain("&lt;i&gt;aperçu&lt;/i&gt;");
			expect(html).toContain("&lt;script&gt;x&lt;/script&gt;");
			expect(html).not.toContain("<script>");
		});

		it("SHOULD load nothing from outside WHEN rendered, neither image nor stylesheet", () => {
			const { html } = buildMailBodies(LAYOUT);

			expect(html).not.toMatch(/<img|<link|url\(/);
		});

		it("SHOULD declare both colour schemes WHEN rendered, for the clients that switch to dark mode", () => {
			const { html } = buildMailBodies(LAYOUT);

			expect(html).toContain('<meta name="color-scheme" content="light dark">');
			expect(html).toContain("@media (prefers-color-scheme:dark)");
		});
	});
});
