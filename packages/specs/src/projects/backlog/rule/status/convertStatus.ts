import type { EndingTypeEnum } from "../../enum/endingType.enum.ts";
import { StatusEnum } from "../../enum/status.enum.ts";
import { isStatusAllowed } from "./isStatusAllowed.ts";

// Statuts qui remplacent un statut devenu incompatible avec le nouveau type de fin
const replacements: Partial<Record<StatusEnum, StatusEnum>> = {
	[StatusEnum.FINISHED]: StatusEnum.DEEMED_FINISHED,
	[StatusEnum.DEEMED_FINISHED]: StatusEnum.FINISHED,
	[StatusEnum.WATCHED]: StatusEnum.NOT_STARTED,
};

// Changer le type de fin d'un jeu : Fini ↔ Estimé fini, Vu sans jouer → Pas commencé ; un statut compatible ne change pas
export function convertStatus(
	status: StatusEnum,
	endingType: EndingTypeEnum,
): StatusEnum {
	if (isStatusAllowed(status, endingType)) return status;
	return replacements[status] ?? status;
}
