// Mêmes clés, et chaque valeur identique (Object.is) : deux objets qui ne diffèrent que par leur identité
export function areShallowEquals(
	first: Record<string, unknown>,
	second: Record<string, unknown>,
): boolean {
	const firstKeys = Object.keys(first);
	return (
		firstKeys.length === Object.keys(second).length &&
		firstKeys.every(
			(key) => key in second && Object.is(first[key], second[key]),
		)
	);
}
