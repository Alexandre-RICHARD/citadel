import type { BacklogColumnEnum } from "../../enum/backlogColumn.enum.ts";
import type { ColumnFilterKindEnum } from "../../enum/columnFilterKind.enum.ts";

// Filtre d'une colonne, un seul par colonne ; `Column` : les colonnes du tableau, celles des jeux par défaut
export type ColumnFilter<Column extends string = BacklogColumnEnum> =
	// « contient », ou valeur exacte après un clic sur une série
	| {
			column: Column;
			kind: ColumnFilterKindEnum.TEXT;
			text: string;
			isExact: boolean;
	  }
	// Des valeurs de liste, cumulables : une ligne passe si elle a l'une d'elles. Clé du type de fin ou du statut, nom de la plateforme
	| {
			column: Column;
			kind: ColumnFilterKindEnum.VALUE;
			values: string[];
	  }
	| {
			column: Column;
			kind: ColumnFilterKindEnum.BOOLEAN;
			value: boolean;
	  }
	// Bornes incluses ; les temps sont en minutes
	| {
			column: Column;
			kind: ColumnFilterKindEnum.NUMBER_RANGE;
			min: number | null;
			max: number | null;
	  }
	// Dates ISO, bornes incluses
	| {
			column: Column;
			kind: ColumnFilterKindEnum.DATE_RANGE;
			from: string | null;
			to: string | null;
	  };
