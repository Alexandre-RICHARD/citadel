import { ColumnFilterKindEnum } from "../../enum/columnFilterKind.enum.ts";
import { MediaColumnEnum } from "../../enum/mediaColumn.enum.ts";
import type { ColumnFilterKinds } from "./columnFilterKinds.type.ts";

// Sorte de filtre de chaque colonne du tableau des films et séries ; la miniature et les actions n'ont ni filtre ni tri
export const mediaColumnFilterKinds: ColumnFilterKinds<MediaColumnEnum> = {
	[MediaColumnEnum.THUMBNAIL]: null,
	[MediaColumnEnum.TITLE]: ColumnFilterKindEnum.TEXT,
	[MediaColumnEnum.MEDIA_TYPE]: ColumnFilterKindEnum.VALUE,
	[MediaColumnEnum.ORIGINAL_LANGUAGE]: ColumnFilterKindEnum.VALUE,
	[MediaColumnEnum.SAGA]: ColumnFilterKindEnum.TEXT,
	[MediaColumnEnum.SAGA_NUMBER]: ColumnFilterKindEnum.NUMBER_RANGE,
	[MediaColumnEnum.RELEASE_DATE]: ColumnFilterKindEnum.DATE_RANGE,
	// En minutes, saisie en heures comme les temps des jeux
	[MediaColumnEnum.RUNTIME]: ColumnFilterKindEnum.NUMBER_RANGE,
	[MediaColumnEnum.IN_PROGRESS]: ColumnFilterKindEnum.BOOLEAN,
	[MediaColumnEnum.COMMENT]: ColumnFilterKindEnum.TEXT,
	[MediaColumnEnum.WATCHED]: ColumnFilterKindEnum.BOOLEAN,
	[MediaColumnEnum.UP_NEXT]: ColumnFilterKindEnum.BOOLEAN,
	[MediaColumnEnum.TMDB_ID]: ColumnFilterKindEnum.TEXT,
	[MediaColumnEnum.ACTIONS]: null,
};
