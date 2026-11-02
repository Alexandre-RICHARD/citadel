/**
 * Avec Secure, le préfixe __Host- : le navigateur n'accepte alors le cookie que posé en HTTPS, par ce seul hôte, sur
 * Path=/ (aucun sous-domaine ne peut l'écraser). Sans Secure (dev en http://localhost), le préfixe le ferait refuser
 */
export function buildCookieName(baseName: string, isSecure: boolean): string {
	return isSecure ? `__Host-${baseName}` : baseName;
}
