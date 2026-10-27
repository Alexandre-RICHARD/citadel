import { loremParagraphs } from "../../../common/placeholder/loremParagraphs";
import type { ProjectFact } from "./projectFact.type";

// Les trois points de la présentation, en texte provisoire ; offset varie les paragraphes d'un projet à l'autre
export function buildPlaceholderFacts(offset: number): ProjectFact[] {
	const count = loremParagraphs.length;
	return [
		{ title: "À quoi ça sert", text: loremParagraphs[offset % count] },
		{ title: "Pour qui", text: loremParagraphs[(offset + 2) % count] },
		{ title: "Comment ça marche", text: loremParagraphs[(offset + 4) % count] },
	];
}
