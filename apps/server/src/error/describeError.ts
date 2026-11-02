// Assez pour remonter d'une DatabaseError à l'erreur du driver, sans boucler sur une cause circulaire
const MAX_CAUSE_DEPTH = 5;

const STACK_FRAME_PREFIX = /^\s+at /;

// Les messages par champ d'une ValidationError de Sequelize (« email must be unique ») : le champ, jamais sa valeur
function describeFieldErrors(error: Error): string[] {
	if (!("errors" in error) || !Array.isArray(error.errors)) return [];
	return error.errors.flatMap((item: unknown) =>
		typeof item === "object" &&
		item !== null &&
		"message" in item &&
		typeof item.message === "string"
			? [`  - ${item.message}`]
			: [],
	);
}

// Le nom et le message tels qu'ils sont, puis les lignes « at » de la pile : l'en-tête de la pile peut dater d'avant le
// message (Sequelize remplit le sien après coup : sa pile commence par « Error: » seul)
function describeStackedError(error: Error): string {
	const frames = (error.stack ?? "")
		.split("\n")
		.filter((line) => STACK_FRAME_PREFIX.test(line));
	return [
		`${error.name}: ${error.message}`,
		...describeFieldErrors(error),
		...frames,
	].join("\n");
}

function describeOne(error: unknown): string {
	if (error instanceof Error) return describeStackedError(error);
	if (typeof error === "object" && error !== null)
		return "Non-Error value thrown (object)";
	return `Non-Error value thrown: ${String(error)}`;
}

// La cause standard, sinon l'erreur du driver que Sequelize garde dans `original`
function readCause(error: unknown): unknown {
	if (!(error instanceof Error)) return undefined;
	if (error.cause !== undefined) return error.cause;
	return "original" in error && error.original instanceof Error
		? error.original
		: undefined;
}

/**
 * Ce qu'on garde d'une erreur dans les logs et dans error_log : nom, message, pile, messages par champ, et de même pour
 * ses causes. Jamais ses autres propriétés, que `inspect` recopierait : le corps d'une requête (`body` de body-parser),
 * les paramètres d'une requête SQL (`parameters`, `sql` de Sequelize) ou le contenu d'un objet lancé tel quel
 */
export function describeError(error: unknown): string {
	const lines = [describeOne(error)];
	let cause = readCause(error);

	for (let depth = 0; cause !== undefined && depth < MAX_CAUSE_DEPTH; depth++) {
		lines.push(`Caused by: ${describeOne(cause)}`);
		cause = readCause(cause);
	}

	return lines.join("\n");
}
