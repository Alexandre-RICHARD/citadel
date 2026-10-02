export function objectEntriesToObject<K extends string, V>(
	objectEntries: [K, V][],
): Record<K, V> {
	return Object.fromEntries(objectEntries) as Record<K, V>;
}
