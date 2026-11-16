import type { ColumnFilterKindEnum } from "../../enum/columnFilterKind.enum.ts";

// Sorte de filtre de chaque colonne d'un tableau (jeux, médias) ; null : ni filtre ni tri (miniature, actions)
export type ColumnFilterKinds<Column extends string> = Readonly<
	Record<Column, ColumnFilterKindEnum | null>
>;
