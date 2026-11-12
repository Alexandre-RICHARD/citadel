import type { EndingTypeEnum } from "../../enum/endingType.enum.ts";
import type { StatusEnum } from "../../enum/status.enum.ts";
import { isFinishedStatus } from "./isFinishedStatus.ts";
import { statusEndingTypes } from "./statusEndingTypes.ts";

// Les statuts proposés dépendent du type de fin du jeu ; sans type de fin, aucun statut de fin
export function isStatusAllowed(
	status: StatusEnum,
	endingType: EndingTypeEnum | null,
): boolean {
	if (endingType === null) return !isFinishedStatus(status);
	return statusEndingTypes[status].includes(endingType);
}
