export function areStrictlyDeeplyEquals<T>(obj1?: T, obj2?: T): boolean {
	if (obj1 === obj2) return true;

	if (
		typeof obj1 !== "object" ||
		obj1 === null ||
		typeof obj2 !== "object" ||
		obj2 === null
	) {
		return false;
	}

	// Une date n'a aucune clé énumérable : sans ce cas, deux dates seraient toujours égales
	if (obj1 instanceof Date || obj2 instanceof Date) {
		return (
			obj1 instanceof Date &&
			obj2 instanceof Date &&
			Object.is(obj1.getTime(), obj2.getTime())
		);
	}

	if (Array.isArray(obj1) && Array.isArray(obj2)) {
		if (obj1.length !== obj2.length) return false;

		return obj1.every((elem, index) => {
			return areStrictlyDeeplyEquals(elem, obj2[index]);
		});
	}

	if (Array.isArray(obj1) || Array.isArray(obj2)) return false;

	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);

	if (
		keys1.length !== keys2.length ||
		!keys1.every((key) => keys2.includes(key))
	)
		return false;

	return Object.entries(obj1).every(([key, value]) => {
		// TODO T => Pas certain de ce type
		return areStrictlyDeeplyEquals(value, obj2[key as keyof typeof obj2]);
	});
}
