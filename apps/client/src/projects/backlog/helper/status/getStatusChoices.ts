import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";
import { isStatusAllowed } from "@citadel/specs/src/projects/backlog/helper/status/isStatusAllowed";

type StatusChoice = { status: StatusEnum; isDisabled: boolean };

/**
 * Les statuts du sélecteur : ceux que le type de fin propose, plus le statut actuel. Sans type de fin, les statuts de
 * fin restent dans la liste, grisés : ils disent qu'il faut en choisir un
 */
export function getStatusChoices(
	endingType: EndingTypeEnum | null,
	currentStatus: StatusEnum | null,
): StatusChoice[] {
	return Object.values(StatusEnum).flatMap((status): StatusChoice[] => {
		if (status === currentStatus || isStatusAllowed(status, endingType))
			return [{ status, isDisabled: false }];
		return endingType === null ? [{ status, isDisabled: true }] : [];
	});
}
