// Le premier nombre de 6 chiffres de l'email, ou null
export function extractCode(text: string): string | null {
	return /\b\d{6}\b/.exec(text)?.[0] ?? null;
}
