export function enumDtoToFm<E extends object>(
	dto: string,
	enumType: E,
	enumName: string,
): E[keyof E] {
	const searchedValue = dto.replaceAll(" ", "_");
	const foundValue = (Object.values(enumType) as E[keyof E][]).find(
		(value) => value === searchedValue,
	);

	if (foundValue !== undefined) {
		return foundValue;
	}

	throw new Error(
		`Invalid dto name [${searchedValue}]: not found in enum ${enumName}`,
	);
}
