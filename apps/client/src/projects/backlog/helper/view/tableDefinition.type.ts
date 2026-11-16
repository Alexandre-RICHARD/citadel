import type { ColumnFilterKinds } from "@citadel/specs/src/projects/backlog/helper/view/columnFilterKinds.type";

import type { ColumnSetting } from "./columnSetting.type";

// Ce qui distingue un tableau du backlog (jeux, films et séries) ; tout le reste (tri, filtres, URL, colonnes) est commun
export type TableDefinition<Column extends string> = {
	// Sorte de filtre de chaque colonne, la même que celle du serveur
	kinds: ColumnFilterKinds<Column>;
	// Toutes les colonnes, dans l'ordre et avec la visibilité par défaut
	defaultColumns: readonly ColumnSetting<Column>[];
	// Clé du localStorage qui garde la disposition des colonnes, une par tableau
	storageKey: string;
	// Toujours visible : sans elle, plus de menu
	actionsColumn: Column;
	labels: Readonly<Record<Column, string>>;
	// Colonnes de temps : saisies en heures dans les filtres, comparées en minutes
	durationColumns: readonly Column[];
};
