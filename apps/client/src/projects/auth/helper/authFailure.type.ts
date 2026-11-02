// Une limite atteinte (429, 503) bloque le bouton jusqu'à `retryAt`, avec un compte à rebours ; tout autre échec
// s'affiche dans la page, avec « Réessayer » s'il est passager (serveur injoignable). `code` : le code métier, pour
// les pages qui réagissent à l'un d'eux (pseudo pris, parcours expiré…)
export type AuthFailure =
	| { kind: "wait"; retryAt: number; code: string | null }
	| {
			kind: "message";
			message: string;
			code: string | null;
			isRetryable: boolean;
	  };
