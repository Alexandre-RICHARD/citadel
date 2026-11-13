// Un numéro, ou un identifiant opaque (jeton, UUID) : ce qui change à chaque appel d'un même endpoint
const NUMERIC_SEGMENT = /^\d+$/;
const OPAQUE_SEGMENT = /^[A-Za-z0-9_-]{20,}$/;

// Le chemin d'un endpoint, sans paramètres de requête et sans ce qui varie d'un appel à l'autre : les appels d'un même
// endpoint se regroupent, et aucun jeton de lien n'est affiché
export function normalizeEndpointPath(uri: string): string {
	const path = uri.split("?")[0] ?? "";
	return path
		.split("/")
		.map((segment) => {
			if (NUMERIC_SEGMENT.test(segment)) return ":id";
			if (OPAQUE_SEGMENT.test(segment)) return ":token";
			return segment;
		})
		.join("/");
}
