import { buildCsv } from "./buildCsv.ts";
import { buildStoredZip } from "./buildStoredZip.ts";
import type { ExportTable } from "./exportTable.type.ts";

/**
 * Le ZIP de l'export : un CSV par table, avec les lignes de cet utilisateur. Les tables se lisent l'une après l'autre,
 * sans transaction : l'export est un instantané à quelques millisecondes près
 */
export async function buildUserDataArchive(
	tables: readonly ExportTable[],
	userId: number,
	date: Date,
): Promise<Buffer> {
	const entries = [];
	for (const table of tables) {
		// eslint-disable-next-line no-await-in-loop
		const rows = await table.findRows(userId);
		entries.push({
			name: table.fileName,
			content: buildCsv(table.headers, rows),
		});
	}
	return buildStoredZip(entries, date);
}
