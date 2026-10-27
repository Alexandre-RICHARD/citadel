// Garde la valeur en JSON ; stockage indisponible (navigation privée, quota…) : elle ne vaudra que pour la session
export function writeLocalStorage(key: string, value: unknown): void {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Rien à faire : l'interface garde la valeur en mémoire
	}
}
