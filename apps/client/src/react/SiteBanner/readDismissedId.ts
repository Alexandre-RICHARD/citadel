// L'identifiant du dernier bandeau fermé, relu du localStorage : tout autre contenu compte comme aucun
export function readDismissedId(stored: unknown): string | null {
	return typeof stored === "string" ? stored : null;
}
