import { useEffect, useState } from "react";

function readStoredValue(key: string): unknown {
	try {
		const stored = localStorage.getItem(key);
		return stored === null ? undefined : JSON.parse(stored);
	} catch {
		// JSON invalide ou stockage indisponible : comme si rien n'était stocké
		return undefined;
	}
}

/**
 * Comme useState, mais la valeur est sauvegardée dans le localStorage du navigateur.
 * `sanitize` reçoit la valeur relue (ou undefined s'il n'y en a pas) et doit renvoyer une valeur
 * valide : le stockage peut contenir une ancienne version ou avoir été modifié à la main.
 */
export function usePersistentState<T>(
	key: string,
	sanitize: (stored: unknown) => T,
): [T, (value: T) => void] {
	const [value, setValue] = useState<T>(() => sanitize(readStoredValue(key)));

	useEffect(() => {
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch {
			// Stockage indisponible (navigation privée, quota…) : la valeur reste valable pour la session
		}
	}, [key, value]);

	return [value, setValue];
}
