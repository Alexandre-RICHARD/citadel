import type { BacklogColumnEnum } from "../../enum/backlogColumn.enum.ts";
import type { SortDirectionEnum } from "../../enum/sortDirection.enum.ts";

// Un critère du tri multi-colonnes (`Column` : celles des jeux par défaut) ; l'ordre d'une liste de critères donne leur priorité
export type SortCriterion<Column extends string = BacklogColumnEnum> = {
	column: Column;
	direction: SortDirectionEnum;
};
