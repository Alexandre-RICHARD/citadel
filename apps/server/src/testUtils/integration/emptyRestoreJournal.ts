import { existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

// Les fichiers du journal, et ceux que ses tests posent à côté (2001-08-26.jsonl.notes) : rien d'autre n'est effacé,
// même si la variable désignait un dossier par erreur
const TEST_JOURNAL_FILE = /^\d{4}-\d{2}-\d{2}\.jsonl/;

/**
 * Le journal de restauration des tests repart vide, comme la base : ses lignes désignent des comptes par leur
 * identifiant, que la base neuve redonne à d'autres comptes. Lu dans l'environnement des tests, déjà chargé
 */
export function emptyRestoreJournal(): void {
	const directory = process.env.AUTH_RESTORE_JOURNAL_DIR;
	if (directory === undefined || directory === "")
		throw new Error("AUTH_RESTORE_JOURNAL_DIR manque dans le .env.test");
	if (!existsSync(directory)) return;
	for (const fileName of readdirSync(directory))
		if (TEST_JOURNAL_FILE.test(fileName))
			rmSync(path.join(directory, fileName));
}
