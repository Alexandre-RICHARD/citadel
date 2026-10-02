export function getIsPrimitive(variable: unknown) {
	return (
		variable === null ||
		(typeof variable !== "object" && typeof variable !== "function")
	);
}
