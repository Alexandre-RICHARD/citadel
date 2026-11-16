import { NasColumnEnum } from "@citadel/specs/src/projects/backlog/enum/nasColumn.enum.ts";
import { NasQualityEnum } from "@citadel/specs/src/projects/backlog/enum/nasQuality.enum.ts";
import { NasSharingEnum } from "@citadel/specs/src/projects/backlog/enum/nasSharing.enum.ts";
import { NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum.ts";

import type { NasDetailsBean } from "../merge/nasDetailsBean.type.ts";
import { getNasColumnValue } from "./getNasColumnValue.ts";

/**
 * Valeur de tri d'une colonne du NAS : les états dans leur ordre (stockage du moins avancé au plus avancé, qualité de la
 * moins bonne à la meilleure, partage du meilleur au moins bon), « Vérifié » sur la part vérifiée, les listes sur leur
 * nombre de valeurs
 */
export function getNasSortValue(
	column: NasColumnEnum,
	nas: NasDetailsBean,
): string | number | null {
	switch (column) {
		case NasColumnEnum.VERIFIED:
			return nas.verifiableCount === 0
				? 0
				: nas.verifiedCount / nas.verifiableCount;
		case NasColumnEnum.STORAGE:
			return Object.values(NasStorageEnum).indexOf(nas.storage);
		case NasColumnEnum.SHARING:
			return Object.values(NasSharingEnum).indexOf(nas.sharing);
		case NasColumnEnum.QUALITY:
			return nas.quality === null
				? null
				: Object.values(NasQualityEnum).indexOf(nas.quality);
		default: {
			const value = getNasColumnValue(column, nas);
			if (Array.isArray(value)) return value.length;
			return typeof value === "boolean"
				? Number(value)
				: (value as string | number | null);
		}
	}
}
