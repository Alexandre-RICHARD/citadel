const HTML_ENTITIES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

// Un texte venu d'un visiteur (sujet, message) s'affiche tel quel dans un mail HTML, sans jamais devenir une balise
export function escapeHtml(text: string): string {
	return text.replaceAll(
		/[&<>"']/g,
		(character) => HTML_ENTITIES[character] ?? character,
	);
}
