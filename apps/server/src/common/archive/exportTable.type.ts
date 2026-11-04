import type { CsvCell } from "./csvCell.type.ts";

// Un fichier CSV de l'export des données d'un utilisateur : une table, ses colonnes, et ses lignes à lui seul
export type ExportTable = {
	fileName: string;
	headers: readonly string[];
	findRows: (userId: number) => Promise<CsvCell[][]>;
};
