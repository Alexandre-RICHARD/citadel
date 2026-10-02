export function getIsPrimitiveHelper(variable: unknown) {
	return (
		variable === null ||
		(typeof variable !== "object" && typeof variable !== "function")
	);
}
