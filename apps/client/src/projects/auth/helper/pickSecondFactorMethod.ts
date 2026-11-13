import { SecondFactorMethodEnum } from "@citadel/specs/src/projects/auth/enum/secondFactorMethod.enum";

type MethodChoice = {
	// Ce que l'étape propose, dans l'ordre du serveur
	offered: readonly SecondFactorMethodEnum[];
	// Ce que l'utilisateur a choisi ; null tant qu'il n'a rien choisi
	chosen: SecondFactorMethodEnum | null;
	// Le quota d'emails : fermé, le code par email ne peut plus partir
	isMailOpen: boolean;
};

/**
 * La méthode affichée : celle choisie si l'étape la propose toujours (un facteur retiré ailleurs la fait disparaître),
 * sinon la première utilisable (le code par email ne l'est plus quand le quota est épuisé), sinon la première proposée.
 * null : l'étape ne propose rien
 */
export function pickSecondFactorMethod({
	offered,
	chosen,
	isMailOpen,
}: MethodChoice): SecondFactorMethodEnum | null {
	if (chosen !== null && offered.includes(chosen)) return chosen;
	const usable = offered.find(
		(method) => isMailOpen || method !== SecondFactorMethodEnum.EMAIL,
	);
	return usable ?? offered[0] ?? null;
}
