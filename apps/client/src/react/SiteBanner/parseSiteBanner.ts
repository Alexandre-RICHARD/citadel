import type { SiteBanner } from "./siteBanner.type";

// La réponse de /banner.json, vérifiée : un fichier abîmé, ou une page HTML (le serveur
// de dev de Vite n'a pas de bandeau), n'affiche rien
export function parseSiteBanner(value: unknown): SiteBanner | null {
	if (typeof value !== "object" || value === null) return null;
	const { id, kind, message, endsAt } = value as Record<string, unknown>;
	if (typeof id !== "string" || typeof message !== "string" || message === "")
		return null;
	return {
		id,
		kind: kind === "restore" ? "restore" : "message",
		message,
		endsAt: typeof endsAt === "string" ? endsAt : null,
	};
}
