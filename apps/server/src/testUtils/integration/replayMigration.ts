import { readFile } from "node:fs/promises";

import { sequelize } from "../../configuration/sequelize.ts";

const migrationsDirectoryUrl = new URL(
	"../../sql/migrations/",
	import.meta.url,
);
const SQL_LINE_COMMENT = /^\s*--.*$/gm;

// Le driver n'exécute qu'une instruction par requête : le fichier est découpé à ses « ; »
function splitStatements(sql: string): string[] {
	return sql
		.replace(SQL_LINE_COMMENT, "")
		.split(";")
		.map((statement) => statement.trim())
		.filter((statement) => statement !== "");
}

/**
 * Rejoue une migration déjà appliquée par Flyway, après que le test a remis la base dans l'état d'avant : prouve ce
 * qu'elle fait des lignes existantes. Pour les migrations sans « ; » dans leurs textes ni procédure stockée
 */
export async function replayMigration(fileName: string): Promise<void> {
	const sql = await readFile(new URL(fileName, migrationsDirectoryUrl), "utf8");
	for (const statement of splitStatements(sql))
		// Dans l'ordre du fichier : chaque instruction dépend des précédentes
		// eslint-disable-next-line no-await-in-loop
		await sequelize.query(statement);
}
