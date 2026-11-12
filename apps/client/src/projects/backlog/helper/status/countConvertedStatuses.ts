import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import type { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";
import { convertStatus } from "@citadel/specs/src/projects/backlog/helper/status/convertStatus";

// Combien de ces statuts le nouveau type de fin convertit (Fini ↔ Estimé fini, Vu sans jouer → Pas commencé)
export function countConvertedStatuses(
	statuses: StatusEnum[],
	endingType: EndingTypeEnum,
): number {
	return statuses.filter(
		(status) => convertStatus(status, endingType) !== status,
	).length;
}
