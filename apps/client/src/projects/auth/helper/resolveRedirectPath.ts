// Seule une page de ce site : un lien piégé (?redirect=https://ailleurs, //ailleurs) ne fait jamais quitter le site après
// la connexion
function isSitePath(path: string): boolean {
	return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
}

// Où aller une fois connecté : la page demandée au départ, sinon `fallback`
export function resolveRedirectPath(
	redirect: string | null,
	fallback: string,
): string {
	return redirect !== null && isSitePath(redirect) ? redirect : fallback;
}
