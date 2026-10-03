// Saisie valide : `data` est la sortie du schéma (nettoyée), prête à envoyer.
// Saisie invalide : `message`, phrase française de la première règle enfreinte
export type InputCheck<Output> =
	{ isValid: true; data: Output } | { isValid: false; message: string };
