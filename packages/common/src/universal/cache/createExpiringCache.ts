type Options = {
	// Durée de vie d'une entrée
	durationMs: number;
	// Entrées gardées, au plus : au-delà, les plus anciennes partent les premières
	maxEntries: number;
	// L'heure, remplaçable par les tests
	now?: () => number;
};

type Entry<Value> = {
	value: Value;
	expiresAt: number;
};

/**
 * Un petit cache en mémoire, borné en durée et en nombre d'entrées : le temps d'ouvrir une fiche puis de la valider,
 * sans relire le service extérieur. Une même valeur peut être rangée sous plusieurs clés
 */
export function createExpiringCache<Key, Value>({
	durationMs,
	maxEntries,
	now = Date.now,
}: Options) {
	const entries = new Map<Key, Entry<Value>>();

	function forgetExpired(currentTime: number): void {
		for (const [key, entry] of entries)
			if (entry.expiresAt <= currentTime) entries.delete(key);
		// Une Map garde l'ordre d'ajout : les premières clés sont les plus anciennes
		const overflow = Math.max(0, entries.size - maxEntries);
		for (const key of [...entries.keys()].slice(0, overflow))
			entries.delete(key);
	}

	function get(key: Key): Value | undefined {
		const entry = entries.get(key);
		return entry && entry.expiresAt > now() ? entry.value : undefined;
	}

	function set(keys: readonly Key[], value: Value): void {
		const currentTime = now();
		const entry = { value, expiresAt: currentTime + durationMs };
		for (const key of keys) {
			// Remise en fin de Map : une clé rafraîchie redevient la plus récente
			entries.delete(key);
			entries.set(key, entry);
		}
		forgetExpired(currentTime);
	}

	function clear(): void {
		entries.clear();
	}

	return { get, set, clear };
}
