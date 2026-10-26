import type { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";

// Une colonne du tableau ; l'ordre d'une liste de réglages est l'ordre d'affichage
export type ColumnSetting = {
	key: BacklogColumnEnum;
	isVisible: boolean;
};
