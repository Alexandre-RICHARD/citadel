// « de » s'élide devant une voyelle : « Impossible d'ajouter », pas « Impossible de ajouter »
const VOWEL_START = /^[aeiouyàâäéèêëîïôöûüù]/i;

// Format unique des échecs, toast comme zone en erreur : « Impossible de {action} : {raison}. »
export function buildFailureMessage(
	actionLabel: string,
	reason: string,
): string {
	const preposition = VOWEL_START.test(actionLabel) ? "d'" : "de ";
	return `Impossible ${preposition}${actionLabel} : ${reason}.`;
}
