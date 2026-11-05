import { QueryTypes } from "sequelize";

import { sequelize } from "../../configuration/sequelize.ts";
import { DatabaseError } from "../../error/DatabaseError.ts";
import type { CsvCell } from "./csvCell.type.ts";
import type { ExportTable } from "./exportTable.type.ts";

type SqlExportTable = {
	// Le nom de la table, sans extension
	tableName: string;
	// Les colonnes exportées, dans l'ordre : chacune est un alias de `sql`. Jamais un hash, une empreinte ni un secret
	columns: readonly string[];
	// La lecture des lignes de l'utilisateur `:userId`, triées
	sql: string;
};

/**
 * L'export d'une table sans user_id, dont le propriétaire se trouve par jointure (les boss par leur jeu, les DLC faits
 * par leur version jouée). Les colonnes gardent le nom de la colonne SQL
 */
export function createSqlExportTable({
	tableName,
	columns,
	sql,
}: SqlExportTable): ExportTable {
	return {
		fileName: `${tableName}.csv`,
		headers: columns,
		async findRows(userId) {
			try {
				const rows = await sequelize.query<Record<string, CsvCell>>(sql, {
					type: QueryTypes.SELECT,
					replacements: { userId },
				});
				return rows.map((row) => columns.map((column) => row[column]));
			} catch (error) {
				throw new DatabaseError(`Failed to export ${tableName}`, {
					cause: error,
				});
			}
		},
	};
}
