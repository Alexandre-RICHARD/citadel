import type { FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum";
import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/helper/view/columnFilter.type";
import type { SortCriterion } from "@citadel/specs/src/projects/backlog/helper/view/sortCriterion.type";

// Tri, filtres (et leur combinaison) du tableau : dans l'URL de la page, et envoyés tels quels au serveur
export type BacklogView = {
	sort: SortCriterion[];
	filters: ColumnFilter[];
	filterMode: FilterModeEnum;
};
