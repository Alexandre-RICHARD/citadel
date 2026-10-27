/**
 * Valeur gardée dans le localStorage, relue depuis son JSON ; undefined si rien n'y est, si le JSON est illisible ou si
 * le stockage est inaccessible. Elle reste à vérifier : une ancienne version du site ou une main l'a peut-être écrite
 */
export function readLocalStorage(key: string): unknown {
	try {
		const storedValue = localStorage.getItem(key);
		return storedValue === null ? undefined : JSON.parse(storedValue);
	} catch {
		return undefined;
	}
}
