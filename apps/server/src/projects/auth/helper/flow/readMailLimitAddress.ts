type FlowFacts = {
	email: string;
	payload: unknown;
};

/**
 * Ce que compte la limite de mails « par adresse » : l'identifiant tapé quand le parcours le garde (connexion par
 * email, mot de passe oublié), sinon l'adresse du mail. Jamais l'email d'un compte trouvé à partir d'un pseudo : un
 * pseudo et une adresse du même compte partageraient leur compteur, et un 429 dirait qu'ils vont ensemble. Selon le
 * chemin de lecture, la colonne JSON arrive parsée ou en texte
 */
export function readMailLimitAddress({ email, payload }: FlowFacts): string {
	const value: unknown =
		typeof payload === "string" ? JSON.parse(payload) : payload;
	return typeof value === "object" &&
		value !== null &&
		"identifier" in value &&
		typeof value.identifier === "string"
		? value.identifier
		: email;
}
