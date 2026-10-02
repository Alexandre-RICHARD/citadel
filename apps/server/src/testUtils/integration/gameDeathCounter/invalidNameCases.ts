// Toutes les raisons de refuser un nom de jeu ou de boss (VARCHAR 255, obligatoire, trim).
// `name: undefined` disparaît à la sérialisation JSON : c'est le cas du champ absent
export const INVALID_NAME_CASES: {
	reason: string;
	name: unknown;
	message: string;
}[] = [
	{
		reason: "the name is missing",
		name: undefined,
		message: "Name should be a string",
	},
	{
		reason: "the name is null",
		name: null,
		message: "Name should be a string",
	},
	{
		reason: "the name is a number",
		name: 42,
		message: "Name should be a string",
	},
	{
		reason: "the name is an array",
		name: ["Cuphead"],
		message: "Name should be a string",
	},
	{
		reason: "the name is empty",
		name: "",
		message: "Name should contain at least 1 character",
	},
	{
		reason: "the name only contains spaces, tabs and line breaks",
		name: " \t\n ",
		message: "Name should contain at least 1 character",
	},
	{
		reason:
			"the name contains an isolated half of an emoji, that the database would replace with �",
		name: "Elden \uD83D Ring",
		message: "Name should not contain invalid characters",
	},
	{
		reason: "the name exceeds 255 characters",
		name: "Dark Souls III ".repeat(18).slice(0, 256),
		message: "Name should contain at most 255 characters",
	},
];
