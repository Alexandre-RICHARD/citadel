import { ColumnFilterKindEnum } from "../../enum/columnFilterKind.enum.ts";
import { NasColumnEnum } from "../../enum/nasColumn.enum.ts";
import type { ColumnFilterKinds } from "./columnFilterKinds.type.ts";

// Sorte de filtre de chaque colonne du NAS. Langues et écarts sont des listes : une ligne en a plusieurs à la fois
export const nasColumnFilterKinds: ColumnFilterKinds<NasColumnEnum> = {
	[NasColumnEnum.VERIFIED]: ColumnFilterKindEnum.BOOLEAN,
	[NasColumnEnum.STORAGE]: ColumnFilterKindEnum.VALUE,
	[NasColumnEnum.JELLYFIN_COLLECTION]: ColumnFilterKindEnum.TEXT,
	[NasColumnEnum.SHARING]: ColumnFilterKindEnum.VALUE,
	// Les noms des torrents et de leurs trackers
	[NasColumnEnum.TORRENTS]: ColumnFilterKindEnum.TEXT,
	[NasColumnEnum.QUALITY]: ColumnFilterKindEnum.VALUE,
	[NasColumnEnum.LANGUAGES]: ColumnFilterKindEnum.VALUE,
	// En gigaoctets
	[NasColumnEnum.SIZE]: ColumnFilterKindEnum.NUMBER_RANGE,
	[NasColumnEnum.GB_PER_HOUR]: ColumnFilterKindEnum.NUMBER_RANGE,
	[NasColumnEnum.GAPS]: ColumnFilterKindEnum.VALUE,
};
