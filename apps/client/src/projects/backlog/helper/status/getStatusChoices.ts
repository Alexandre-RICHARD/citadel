import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";
import { isStatusAllowed } from "@citadel/specs/src/projects/backlog/helper/status/isStatusAllowed";

type StatusChoice = { status: StatusEnum; isDisabled: boolean };

/**
 * Les statuts du sélecteur, tous, dans l'ordre de l'échelle. Sans type de fin, les statuts de fin sont grisés : ils
 * disent qu'il faut en choisir un. Le statut actuel reste toujours choisissable
 */
export function getStatusChoices(
	endingType: EndingTypeEnum | null,
	currentStatus: StatusEnum | null,
): StatusChoice[] {
	return Object.values(StatusEnum).map((status) => ({
		status,
		isDisabled:
			status !== currentStatus && !isStatusAllowed(status, endingType),
	}));
}
