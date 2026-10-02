export function objectEntriesToArray<T>(objectEntries: [string, T][]): T[] {
	return objectEntries.map(([, value]) => value);
}
