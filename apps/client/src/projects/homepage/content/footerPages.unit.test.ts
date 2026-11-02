import { describe, expect, it } from "vitest";

import { isExternalLinkKey } from "../../../common/links/isExternalLinkKey";
import { footerPages } from "./footerPages";

const LINK_KEY_PATTERN = /\]\(([^)]*)\)/g;

function getAllTexts(): string[] {
	return footerPages.flatMap((page) =>
		page.kind === "text"
			? [page.intro, ...page.sections.flatMap((section) => section.paragraphs)]
			: [page.intro],
	);
}

describe("footerPages.ts", () => {
	describe("links", () => {
		it("SHOULD only use keys of the external links dictionary WHEN a text has a link", () => {
			const unknownKeys = getAllTexts()
				.flatMap((text) => [...text.matchAll(LINK_KEY_PATTERN)])
				.map((match) => match[1] ?? "")
				.filter((key) => !isExternalLinkKey(key));

			expect(unknownKeys).toStrictEqual([]);
		});
	});

	describe("slugs", () => {
		it("SHOULD give each page its own slug", () => {
			const slugs = footerPages.map((page) => page.slug);

			expect(new Set(slugs).size).toBe(slugs.length);
		});
	});
});
