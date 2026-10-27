// Sans doublon, dans l'ordre de première apparition
export function getUniqueValues<Value>(values: Iterable<Value>): Value[] {
	return [...new Set(values)];
}
