import { describe, expect, it } from "vitest";

import { parseLinkedText } from "./parseLinkedText";

describe("parseLinkedText.ts", () => {
	describe("links", () => {
		it("SHOULD split the text around its links WHEN the keys are in the dictionary", () => {
			expect(
				parseLinkedText(
					"Via [Cloudflare](cloudflare) et [sa politique](cloudflarePrivacy), merci.",
				),
			).toStrictEqual([
				{ kind: "text", text: "Via " },
				{ kind: "link", text: "Cloudflare", key: "cloudflare" },
				{ kind: "text", text: " et " },
				{ kind: "link", text: "sa politique", key: "cloudflarePrivacy" },
				{ kind: "text", text: ", merci." },
			]);
		});

		it("SHOULD give a single link WHEN the whole text is one", () => {
			expect(
				parseLinkedText("[contact@example.fr](contactMail)"),
			).toStrictEqual([
				{ kind: "link", text: "contact@example.fr", key: "contactMail" },
			]);
		});

		it("SHOULD keep the link text without link WHEN the key is unknown", () => {
			expect(parseLinkedText("Voir [ici](nowhere).")).toStrictEqual([
				{ kind: "text", text: "Voir " },
				{ kind: "text", text: "ici" },
				{ kind: "text", text: "." },
			]);
		});
	});

	describe("plain text", () => {
		it("SHOULD give one text part WHEN there is no link", () => {
			expect(parseLinkedText("Bonjour [tout le monde]")).toStrictEqual([
				{ kind: "text", text: "Bonjour [tout le monde]" },
			]);
		});

		it("SHOULD give nothing WHEN the text is empty", () => {
			expect(parseLinkedText("")).toStrictEqual([]);
		});
	});
});
