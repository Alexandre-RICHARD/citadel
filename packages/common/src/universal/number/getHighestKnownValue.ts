// La plus grande valeur, les inconnues (null) ignorées ; null s'il n'y en a aucune de connue
export function getHighestKnownValue(
	values: readonly (number | null)[],
): number | null {
	const knownValues = values.filter((value) => value !== null);
	return knownValues.length === 0 ? null : Math.max(...knownValues);
}
