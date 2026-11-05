import type { Transaction } from "sequelize";

import type { ExportTable } from "../archive/exportTable.type.ts";

// Ce qu'un projet garde d'un compte : de quoi le supprimer (suppression du compte ou des données du projet) et l'exporter
export type ProjectUserData = {
	// Toutes les lignes du compte dans le projet, dans l'ordre que demandent ses clés étrangères
	deleteAll: (userId: number, transaction: Transaction) => Promise<void>;
	// Un CSV par table, sans aucun secret
	exportTables: readonly ExportTable[];
};
