import type { ColumnFilter } from "@citadel/specs/src/projects/backlog/rule/view/columnFilter.type";
import type { SortCriterion } from "@citadel/specs/src/projects/backlog/rule/view/sortCriterion.type";

// Tri et filtres du tableau : dans l'URL de la page, et envoyés tels quels au serveur
export type BacklogView = {
	sort: SortCriterion[];
	filters: ColumnFilter[];
};
