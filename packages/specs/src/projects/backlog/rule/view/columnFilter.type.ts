import type { BacklogColumnEnum } from "../../enum/backlogColumn.enum.ts";
import type { ColumnFilterKindEnum } from "../../enum/columnFilterKind.enum.ts";

// Filtre d'une colonne (cahier des charges, §9), un seul par colonne
export type ColumnFilter =
	// « contient », ou valeur exacte après un clic sur une série
	| {
			column: BacklogColumnEnum;
			kind: ColumnFilterKindEnum.TEXT;
			text: string;
			isExact: boolean;
	  }
	// Une valeur de liste : clé du type de fin ou du statut, nom de la plateforme
	| {
			column: BacklogColumnEnum;
			kind: ColumnFilterKindEnum.VALUE;
			value: string;
	  }
	| {
			column: BacklogColumnEnum;
			kind: ColumnFilterKindEnum.BOOLEAN;
			value: boolean;
	  }
	// Bornes incluses ; les temps sont en minutes
	| {
			column: BacklogColumnEnum;
			kind: ColumnFilterKindEnum.NUMBER_RANGE;
			min: number | null;
			max: number | null;
	  }
	// Dates ISO, bornes incluses
	| {
			column: BacklogColumnEnum;
			kind: ColumnFilterKindEnum.DATE_RANGE;
			from: string | null;
			to: string | null;
	  };
