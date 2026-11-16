import { normalizeMediaTitle } from "@citadel/specs/src/projects/backlog/helper/nas/normalizeMediaTitle.ts";
import type { SurveyedFolder } from "@citadel/specs/src/projects/backlog/mediaState/surveyedFolder.type.ts";

import type { BacklogMediaRef } from "./backlogMediaRef.type.ts";

/**
 * Le dossier « Titre (année) » est-il celui de ce média ? Même titre (français ou original) et même année, à
 * `yearTolerance` près : une sortie en salle et une sortie ailleurs tombent parfois sur deux années. Un dossier sans
 * année (souvent une série) ne se relie que par son titre
 */
export function matchesFolder(
	folder: SurveyedFolder,
	ref: BacklogMediaRef,
	yearTolerance: number,
): boolean {
	if (!ref.normalizedTitles.includes(normalizeMediaTitle(folder.title)))
		return false;
	if (folder.year === null) return yearTolerance === 0;
	return ref.year !== null && Math.abs(folder.year - ref.year) <= yearTolerance;
}
