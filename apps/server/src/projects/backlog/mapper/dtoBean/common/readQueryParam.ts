// Un paramètre texte d'une query déjà validée, lu par son nom ; null s'il manque
export function readQueryParam(query: object, name: string): string | null {
	const value: unknown = (query as Record<string, unknown>)[name];
	return typeof value === "string" ? value : null;
}
