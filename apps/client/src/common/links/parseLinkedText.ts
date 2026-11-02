import { isExternalLinkKey } from "./isExternalLinkKey";
import type { LinkedTextPart } from "./linkedTextPart.type";

// [texte](clé) : le texte du lien, puis sa clé dans le dictionnaire des liens externes
const LINK_PATTERN = /\[([^\]]+)\]\(([A-Za-z0-9]+)\)/g;

/**
 * Découpe un texte écrit avec des liens « [texte](clé) » en morceaux à afficher. Une clé absente du dictionnaire
 * laisse son texte sans lien : une faute de frappe n'abîme pas la page (un test des pages du footer la repère)
 */
export function parseLinkedText(text: string): LinkedTextPart[] {
	const parts: LinkedTextPart[] = [];
	let textStart = 0;

	for (const match of text.matchAll(LINK_PATTERN)) {
		const [wholeMatch, linkText = "", key = ""] = match;
		const matchStart = match.index;
		if (matchStart > textStart)
			parts.push({ kind: "text", text: text.slice(textStart, matchStart) });

		parts.push(
			isExternalLinkKey(key)
				? { kind: "link", text: linkText, key }
				: { kind: "text", text: linkText },
		);
		textStart = matchStart + wholeMatch.length;
	}

	if (textStart < text.length)
		parts.push({ kind: "text", text: text.slice(textStart) });
	return parts;
}
