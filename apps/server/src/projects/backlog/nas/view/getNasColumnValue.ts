import { NasColumnEnum } from "@citadel/specs/src/projects/backlog/enum/nasColumn.enum.ts";
import { bytesToGb } from "@citadel/specs/src/projects/backlog/helper/nas/bytesToGb.ts";

import type { ColumnValue } from "../../view/common/columnValue.type.ts";
import type { NasDetailsBean } from "../merge/nasDetailsBean.type.ts";

// Une saison ou une série porte une étiquette quand tous ses fichiers l'ont ; un film, quand son fichier l'a
function getCompleteTags(nas: NasDetailsBean): string[] {
	return nas.languageTags
		.filter(({ count }) => nas.fileCount > 0 && count === nas.fileCount)
		.map(({ tag }) => tag);
}

/**
 * Ce qu'affiche une ligne dans une colonne du NAS, pour le tri et les filtres ; null quand la case est vide. « Vérifié » :
 * tous ses fichiers vérifiables le sont ; langues et écarts : la liste de leurs valeurs
 */
export function getNasColumnValue(
	column: NasColumnEnum,
	nas: NasDetailsBean,
): ColumnValue {
	switch (column) {
		case NasColumnEnum.VERIFIED:
			return (
				nas.verifiableCount > 0 && nas.verifiedCount === nas.verifiableCount
			);
		case NasColumnEnum.STORAGE:
			return nas.storage;
		case NasColumnEnum.JELLYFIN_COLLECTION:
			return nas.jellyfinCollection;
		case NasColumnEnum.SHARING:
			return nas.sharing;
		case NasColumnEnum.TORRENTS:
			return nas.torrents.length === 0
				? null
				: nas.torrents.map(({ name }) => name).join(", ");
		case NasColumnEnum.QUALITY:
			return nas.quality;
		case NasColumnEnum.LANGUAGES:
			return getCompleteTags(nas);
		case NasColumnEnum.SIZE:
			return nas.sizeBytes === null ? null : bytesToGb(nas.sizeBytes);
		case NasColumnEnum.GB_PER_HOUR:
			return nas.gbPerHour;
		default:
			return [...new Set(nas.gaps.map(({ kind }) => kind))];
	}
}
