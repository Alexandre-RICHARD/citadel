// Une 429 bloque le bouton jusqu'à `retryAt` (compte à rebours) ; tout autre échec s'écrit sous le formulaire
export type ContactFailure =
	{ kind: "wait"; retryAt: number } | { kind: "message"; message: string };
