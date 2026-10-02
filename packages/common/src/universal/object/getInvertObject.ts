// Les valeurs deviennent les clés ; si deux clés ont la même valeur, la dernière l'emporte
export function getInvertObject<K extends string, V extends string>(
	originalObject: Record<K, V>,
): Record<V, K> {
	return Object.fromEntries(
		Object.entries(originalObject).map(([key, value]) => [value, key]),
	) as Record<V, K>;
}
