// Les maxLength premiers caractères d'un texte, comptés comme MariaDB compte ceux d'un VARCHAR (points de code) :
// un émoji compte pour un, et n'est jamais coupé en deux
export function truncateCodePoints(text: string, maxLength: number): string {
	const codePoints = Array.from(text);
	if (codePoints.length <= maxLength) return text;
	return codePoints.slice(0, maxLength).join("");
}
