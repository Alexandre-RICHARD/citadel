// Classes CSS d'un élément ; les valeurs vides sont ignorées
export function joinClassNames(
	...classNames: (string | false | null | undefined)[]
): string {
	return classNames.filter(Boolean).join(" ");
}
