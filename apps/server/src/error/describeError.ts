// Assez pour remonter d'une DatabaseError à l'erreur du driver, sans boucler sur une cause circulaire
const MAX_CAUSE_DEPTH = 5;

const STACK_FRAME_PREFIX = /^\s+at /;

// Le nom et le message tels qu'ils sont, puis les lignes « at » de la pile : l'en-tête de la pile peut dater d'avant le
// message (Sequelize remplit le sien après coup : sa pile commence par « Error: » seul)
function describeStackedError(error: Error): string {
	const frames = (error.stack ?? "")
		.split("\n")
		.filter((line) => STACK_FRAME_PREFIX.test(line));
	return [`${error.name}: ${error.message}`, ...frames].join("\n");
}

function describeOne(error: unknown): string {
	if (error instanceof Error) return describeStackedError(error);
	if (typeof error === "object" && error !== null)
		return "Non-Error value thrown (object)";
	return `Non-Error value thrown: ${String(error)}`;
}

/**
 * Ce qu'on garde d'une erreur dans les logs et dans error_log : sa pile et celle de ses causes, rien d'autre.
 * Jamais ses autres propriétés, que `inspect` recopierait : le corps d'une requête (`body` de body-parser), les
 * paramètres d'une requête SQL (`parameters`, `sql` de Sequelize) ou le contenu d'un objet lancé tel quel
 */
export function describeError(error: unknown): string {
	const lines = [describeOne(error)];
	let cause = error instanceof Error ? error.cause : undefined;

	for (let depth = 0; cause !== undefined && depth < MAX_CAUSE_DEPTH; depth++) {
		lines.push(`Caused by: ${describeOne(cause)}`);
		cause = cause instanceof Error ? cause.cause : undefined;
	}

	return lines.join("\n");
}
