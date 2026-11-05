import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { authSettings } from "../../../configuration/authSettings.ts";

type RestoreJournalLine = { at: string; userId: number } & Record<
	string,
	unknown
>;

// Les lignes du journal de restauration d'un compte, tous jours confondus : les tests écrivent en parallèle dans le
// même dossier, chacun ne lit que son compte
export async function readRestoreJournal(
	userId: number,
): Promise<RestoreJournalLine[]> {
	let fileNames: string[];
	try {
		fileNames = await readdir(authSettings.restoreJournalDirectory);
	} catch {
		return [];
	}
	const contents = await Promise.all(
		fileNames.map(async (fileName) =>
			readFile(
				path.join(authSettings.restoreJournalDirectory, fileName),
				"utf8",
			),
		),
	);
	return contents
		.flatMap((content) => content.split("\n"))
		.filter((line) => line !== "")
		.map((line) => JSON.parse(line) as RestoreJournalLine)
		.filter((line) => line.userId === userId);
}
