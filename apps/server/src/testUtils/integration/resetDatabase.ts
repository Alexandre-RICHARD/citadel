import { QueryTypes } from "sequelize";

import { sequelize } from "../../configuration/sequelize.ts";

const PRESERVED_TABLES = ["flyway_schema_history"];

type TableNameRow = {
	tableName: string;
};

export async function resetDatabase(): Promise<void> {
	const tableNameRows = await sequelize.query<TableNameRow>(
		`SELECT table_name AS tableName
		FROM information_schema.tables
		WHERE table_schema = DATABASE()
			AND table_type = 'BASE TABLE'
			AND table_name NOT IN (:preservedTables)`,
		{
			type: QueryTypes.SELECT,
			replacements: { preservedTables: PRESERVED_TABLES },
		},
	);

	await sequelize.transaction(async (transaction) => {
		await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { transaction });
		try {
			await Promise.all(
				tableNameRows.map(({ tableName }) =>
					sequelize.query(`TRUNCATE TABLE \`${tableName}\``, {
						transaction,
					}),
				),
			);
		} finally {
			await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { transaction });
		}
	});
}
