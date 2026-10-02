import { QueryTypes } from "sequelize";

import { sequelize } from "../../configuration/sequelize.ts";

type CountRow = {
	rowCount: number;
};

// Les tests s'exécutent un par un : comparer le nombre de lignes avant et après une requête est fiable
export async function countTableRows(
	tableName: "game" | "boss" | "death" | "error_log",
): Promise<number> {
	const countRow = await sequelize.query<CountRow>(
		`SELECT COUNT(*) AS rowCount FROM \`${tableName}\``,
		{ type: QueryTypes.SELECT, plain: true },
	);
	return Number(countRow?.rowCount ?? 0);
}
