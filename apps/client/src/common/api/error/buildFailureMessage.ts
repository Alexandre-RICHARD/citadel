// Format unique des échecs, toast comme zone en erreur : « Impossible de {action} : {raison}. »
export function buildFailureMessage(
	actionLabel: string,
	reason: string,
): string {
	return `Impossible de ${actionLabel} : ${reason}.`;
}
