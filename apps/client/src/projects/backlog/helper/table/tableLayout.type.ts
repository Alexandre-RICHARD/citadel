// Disposition d'un tableau : ses colonnes collées au défilement horizontal, et l'alignement de chacune (classes CSS)
export type TableLayout<Column extends string> = {
	thumbnailColumn: Column;
	nameColumn: Column;
	alignments: Partial<Record<Column, string | undefined>>;
};
