// Toutes les raisons de refuser un nom de jeu ou de boss (VARCHAR 255, obligatoire, trim).
// `name: undefined` disparaît à la sérialisation JSON : c'est le cas du champ absent
export const INVALID_NAME_CASES: {
	reason: string;
	name: unknown;
	message: string;
}[] = [
	{
		reason: "le nom est absent",
		name: undefined,
		message: "Name should be a string",
	},
	{
		reason: "le nom est null",
		name: null,
		message: "Name should be a string",
	},
	{
		reason: "le nom est un nombre",
		name: 42,
		message: "Name should be a string",
	},
	{
		reason: "le nom est un tableau",
		name: ["Cuphead"],
		message: "Name should be a string",
	},
	{
		reason: "le nom est vide",
		name: "",
		message: "Name should contain at least 1 character",
	},
	{
		reason:
			"le nom ne contient que des espaces, tabulations et retours à la ligne",
		name: " \t\n ",
		message: "Name should contain at least 1 character",
	},
	{
		reason:
			"le nom contient une moitié d'emoji isolée, que la base remplacerait par �",
		name: "Elden \uD83D Ring",
		message: "Name should not contain invalid characters",
	},
	{
		reason: "le nom dépasse 255 caractères",
		name: "Dark Souls III ".repeat(18).slice(0, 256),
		message: "Name should contain at most 255 characters",
	},
];
