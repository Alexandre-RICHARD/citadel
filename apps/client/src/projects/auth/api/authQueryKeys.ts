const ROOT = "auth";

export const authQueryKeys = {
	// Qui est connecté : lue par tout le site (header, accès des projets)
	me: () => [ROOT, "me"] as const,
	// Le parcours en cours dans ce navigateur
	flow: () => [ROOT, "flow"] as const,
};
