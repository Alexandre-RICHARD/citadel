import type { FilterModeEnum } from "../../enum/filterMode.enum.ts";
import type { ColumnFilter } from "./columnFilter.type.ts";
import type { SortCriterion } from "./sortCriterion.type.ts";

// Tri, filtres et leur combinaison d'un tableau (jeux, médias) : dans l'URL de la page, et dans la query qui le lit
export type TableView<Column extends string> = {
	sort: SortCriterion<Column>[];
	filters: ColumnFilter<Column>[];
	filterMode: FilterModeEnum;
};
