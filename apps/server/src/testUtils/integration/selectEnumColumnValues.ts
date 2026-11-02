import { QueryTypes } from "sequelize";

import { sequelize } from "../../configuration/sequelize.ts";
import { parseEnumColumnType } from "./parseEnumColumnType.ts";

/**
 * Valeurs permises par une colonne ENUM, dans l'ordre de la migration : un test les compare à l'enum TypeScript du
 * modèle, que rien d'autre ne relie à la base
 */
export async function selectEnumColumnValues(
	tableName: string,
	columnName: string,
): Promise<string[]> {
	const row = await sequelize.query<{ columnType: string }>(
		`SELECT COLUMN_TYPE AS columnType
		FROM information_schema.COLUMNS
		WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :tableName AND COLUMN_NAME = :columnName`,
		{
			type: QueryTypes.SELECT,
			plain: true,
			replacements: { tableName, columnName },
		},
	);
	if (row === null)
		throw new Error(`Colonne ${tableName}.${columnName} introuvable`);
	return parseEnumColumnType(row.columnType);
}
