import type { EndingTypeEnum } from "../../enum/endingType.enum.ts";
import { StatusEnum } from "../../enum/status.enum.ts";
import { isStatusAllowed } from "./isStatusAllowed.ts";

// Statuts qui remplacent un statut devenu incompatible avec le nouveau type de fin
const replacements: Partial<Record<StatusEnum, StatusEnum>> = {
	[StatusEnum.FINISHED]: StatusEnum.DEEMED_FINISHED,
	[StatusEnum.DEEMED_FINISHED]: StatusEnum.FINISHED,
	[StatusEnum.WATCHED]: StatusEnum.NOT_STARTED,
};

// Changer le type de fin d'un jeu : Fini ↔ Estimé fini, Vu sans jouer → Pas commencé ; un statut compatible ne change
// pas. Sans type de fin, un statut de fin repasse à Pas commencé (à la saisie : le serveur refuse de retirer le type de
// fin d'un jeu qui a déjà un statut de fin)
export function convertStatus(
	status: StatusEnum,
	endingType: EndingTypeEnum | null,
): StatusEnum {
	if (isStatusAllowed(status, endingType)) return status;
	return replacements[status] ?? StatusEnum.NOT_STARTED;
}
