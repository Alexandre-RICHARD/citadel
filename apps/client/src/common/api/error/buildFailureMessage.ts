import { regexDictionary } from "@citadel/common/src/universal/regex/regexDictionary";

// Format unique des échecs, toast comme zone en erreur : « Impossible de {action} : {raison}. »
export function buildFailureMessage(
	actionLabel: string,
	reason: string,
): string {
	// « de » s'élide devant une voyelle : « Impossible d'ajouter », pas « Impossible de ajouter »
	const preposition = regexDictionary.frenchVowelStart.test(actionLabel)
		? "d'"
		: "de ";
	return `Impossible ${preposition}${actionLabel} : ${reason}.`;
}
