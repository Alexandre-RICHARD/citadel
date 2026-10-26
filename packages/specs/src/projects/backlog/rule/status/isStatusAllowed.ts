import type { EndingTypeEnum } from "../../enum/endingType.enum.ts";
import type { StatusEnum } from "../../enum/status.enum.ts";
import { statusEndingTypes } from "./statusEndingTypes.ts";

// Les statuts proposés dépendent du type de fin du jeu (cahier des charges, §6)
export function isStatusAllowed(
	status: StatusEnum,
	endingType: EndingTypeEnum,
): boolean {
	return statusEndingTypes[status].includes(endingType);
}
