import type { Attributes, Model, ModelStatic, WhereOptions } from "sequelize";

import { DatabaseError } from "../../error/DatabaseError.ts";
import type { CsvCell } from "./csvCell.type.ts";
import type { ExportTable } from "./exportTable.type.ts";
import { toSnakeCase } from "./toSnakeCase.ts";

type ModelExportTable<Row extends Model> = {
	// Le nom de la table, sans extension
	tableName: string;
	model: ModelStatic<Row>;
	// L'attribut qui désigne le propriétaire de la ligne : « id » pour le compte lui-même, « userId » ailleurs
	ownerAttribute: string;
	// Les seules colonnes exportées : jamais un hash, une empreinte, un jeton ni un secret
	columns: readonly (keyof Row & string)[];
	// L'ordre des lignes ; « id » par défaut, une table sans id (clé composée) donne le sien
	orderAttribute?: keyof Row & string;
};

function isCsvCell(value: unknown): value is CsvCell {
	return (
		value === null ||
		value === undefined ||
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean" ||
		value instanceof Date
	);
}

/**
 * L'export d'une table du modèle : toutes les lignes de l'utilisateur, les colonnes données seulement, sous le nom de la
 * colonne SQL. Une valeur qui n'est pas un texte, un nombre, un booléen ou une date (un buffer, un JSON) est un oubli
 * de l'appelant : c'est une erreur, jamais un fichier à moitié exporté
 */
export function createModelExportTable<Row extends Model>({
	tableName,
	model,
	ownerAttribute,
	columns,
	orderAttribute = "id" as keyof Row & string,
}: ModelExportTable<Row>): ExportTable {
	return {
		fileName: `${tableName}.csv`,
		headers: columns.map((column) => toSnakeCase(column)),
		async findRows(userId) {
			try {
				const rows = await model.findAll({
					where: { [ownerAttribute]: userId } as WhereOptions<Attributes<Row>>,
					attributes: [...columns],
					order: [[orderAttribute, "ASC"]],
				});
				return rows.map((row) =>
					columns.map((column): CsvCell => {
						const value: unknown = row.get(column);
						if (!isCsvCell(value))
							throw new Error(
								`Column ${column} of ${tableName} is not exportable`,
							);
						return value;
					}),
				);
			} catch (error) {
				if (
					error instanceof Error &&
					error.message.includes("is not exportable")
				)
					throw error;
				throw new DatabaseError(`Failed to export ${tableName}`, {
					cause: error,
				});
			}
		},
	};
}
