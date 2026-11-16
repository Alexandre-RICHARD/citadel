import type { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";

// Une colonne du tableau (celles des jeux par défaut) ; l'ordre d'une liste de réglages est l'ordre d'affichage
export type ColumnSetting<Column extends string = BacklogColumnEnum> = {
	key: Column;
	isVisible: boolean;
};
