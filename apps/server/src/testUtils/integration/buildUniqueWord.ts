// Un mot que seul le test qui l'a tiré emploie : les données des autres tests, jamais effacées, ne le contiennent pas
export function buildUniqueWord(): string {
	return `Zq${Math.random().toString(36).slice(2, 10)}`;
}
