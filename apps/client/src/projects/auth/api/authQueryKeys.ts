const ROOT = "auth";

export const authQueryKeys = {
	// Qui est connecté : lue par tout le site (header, accès des projets)
	me: () => [ROOT, "me"] as const,
	// Le parcours en cours dans ce navigateur
	flow: () => [ROOT, "flow"] as const,
	// La double authentification du compte
	factors: () => [ROOT, "factors"] as const,
	// Les sessions ouvertes du compte
	sessions: () => [ROOT, "sessions"] as const,
	// Les codes de secours qui viennent d'être donnés, montrés une seule fois
	newRecoveryCodes: () => [ROOT, "newRecoveryCodes"] as const,
};
