import { loremParagraphs } from "../../../common/placeholder/loremParagraphs";
import type { FooterPageSection } from "./footerPageSection.type";

// Des sections aux vrais titres, en texte provisoire
export function buildPlaceholderSections(
	titles: string[],
): FooterPageSection[] {
	const count = loremParagraphs.length;
	return titles.map((title, index) => ({
		title,
		paragraphs: [
			loremParagraphs[index % count],
			`${loremParagraphs[(index + 3) % count]} ${loremParagraphs[(index + 1) % count]}`,
		],
	}));
}
