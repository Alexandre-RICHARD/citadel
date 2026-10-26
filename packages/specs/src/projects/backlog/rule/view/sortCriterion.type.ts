import type { BacklogColumnEnum } from "../../enum/backlogColumn.enum.ts";
import type { SortDirectionEnum } from "../../enum/sortDirection.enum.ts";

// Un critère du tri multi-colonnes ; l'ordre d'une liste de critères donne leur priorité
export type SortCriterion = {
	column: BacklogColumnEnum;
	direction: SortDirectionEnum;
};
