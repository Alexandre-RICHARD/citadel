// Une 429 bloque le bouton jusqu'à `retryAt` (compte à rebours) ; tout autre échec part en toast, avec « Réessayer » s'il
// est passager (serveur injoignable, fournisseur de mails en panne)
export type ContactFailure =
	| { kind: "wait"; retryAt: number }
	| { kind: "message"; message: string; isRetryable: boolean };
