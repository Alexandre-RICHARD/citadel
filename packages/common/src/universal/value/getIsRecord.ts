// Un objet dont on peut lire les propriétés : une valeur venue de JSON.parse ou d'une API reste à vérifier champ par champ
export function getIsRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
