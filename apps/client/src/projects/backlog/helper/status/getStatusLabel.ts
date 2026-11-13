import type { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import type { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";

import { isEstimatedEndingType } from "./isEstimatedEndingType";
import { statusDescriptions } from "./statusDescriptions";

/**
 * Le libellé d'un statut selon le type de fin du jeu : « Fini » et « Complété » se lisent « Estimé » pour Runs, Bac à
 * sable et Multijoueur. `undefined` : pas de jeu en face (filtre, bulle d'aide), les deux libellés sont réunis
 */
export function getStatusLabel(
	status: StatusEnum,
	endingType: EndingTypeEnum | null | undefined,
): string {
	const { label, estimatedLabel } = statusDescriptions[status];
	if (estimatedLabel === undefined) return label;
	if (endingType === undefined) return `${label} / ${estimatedLabel}`;
	return isEstimatedEndingType(endingType) ? estimatedLabel : label;
}
