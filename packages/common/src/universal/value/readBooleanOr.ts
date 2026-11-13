// Une valeur relue (stockage, paramètre) qui devait être un booléen : elle-même si c'en est un, `fallback` sinon
export function readBooleanOr(value: unknown, fallback: boolean): boolean {
	return typeof value === "boolean" ? value : fallback;
}
