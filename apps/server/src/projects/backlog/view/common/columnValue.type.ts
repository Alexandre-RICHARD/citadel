// Ce qu'affiche une case du tableau, pour le tri et les filtres ; null quand elle est vide. Une liste : les étiquettes d'une
// case qui en porte plusieurs (langues, écarts)
export type ColumnValue = string | number | boolean | readonly string[] | null;
