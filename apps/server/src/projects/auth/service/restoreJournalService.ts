import { appendFile, mkdir, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

import { authSettings } from "../../../configuration/authSettings.ts";
import { logError } from "../../../error/logError.ts";
import type { RestoreJournalEntryBean } from "../bean/restoreJournalEntryBean.type.ts";
import type { RestoreJournalLineBean } from "../bean/restoreJournalLineBean.type.ts";
import { buildRestoreJournalFileName } from "../helper/restoreJournal/buildRestoreJournalFileName.ts";
import { findExpiredRestoreJournalFiles } from "../helper/restoreJournal/findExpiredRestoreJournalFiles.ts";
import { isRestoreJournalFile } from "../helper/restoreJournal/isRestoreJournalFile.ts";
import { parseRestoreJournalLine } from "../helper/restoreJournal/parseRestoreJournalLine.ts";

type ReadJournal = {
	lines: RestoreJournalLineBean[];
	// Lignes abîmées, laissées de côté : la commande « après restauration » les signale
	unreadableCount: number;
};

/**
 * Le journal de restauration (cahier de l'authentification, §10.5) : une ligne JSON par suppression, changement d'email
 * ou de sécurité, hors de la base pour qu'une sauvegarde restaurée ne l'efface pas, puis rejouée après elle. Écrit
 * après la transaction : il ne retient que ce qui a eu lieu
 */
class RestoreJournalService {
	/**
	 * L'action a eu lieu : son échec à s'écrire est loggé (error_log, visible dans la console), jamais renvoyé. Une
	 * restauration la ferait alors oublier, mais refuser une action déjà faite ne la déferait pas
	 */
	async record(entry: RestoreJournalEntryBean): Promise<void> {
		const now = new Date();
		const line = `${JSON.stringify({ at: now.toISOString(), ...entry })}\n`;
		try {
			await mkdir(authSettings.restoreJournalDirectory, { recursive: true });
			// Une seule écriture en ajout (O_APPEND) : deux lignes écrites en même temps ne se mêlent pas
			await appendFile(
				path.join(
					authSettings.restoreJournalDirectory,
					buildRestoreJournalFileName(now),
				),
				line,
			);
		} catch (error) {
			await logError(error, "Journal de restauration");
		}
	}

	// Tout le journal gardé : 10 semaines, l'âge de la plus vieille sauvegarde
	async readAll(): Promise<ReadJournal> {
		const fileNames = (await this.#listFiles()).filter(isRestoreJournalFile);
		const contents = await Promise.all(
			fileNames.map(async (fileName) =>
				readFile(
					path.join(authSettings.restoreJournalDirectory, fileName),
					"utf8",
				),
			),
		);
		const texts = contents
			.flatMap((content) => content.split("\n"))
			.filter((text) => text.trim() !== "");
		const lines = texts
			.map(parseRestoreJournalLine)
			.filter((line) => line !== null);
		return { lines, unreadableCount: texts.length - lines.length };
	}

	// Les jours plus vieux que la plus vieille sauvegarde : plus aucune restauration n'aurait à les rejouer
	async purge(now: Date): Promise<void> {
		const expired = findExpiredRestoreJournalFiles(
			await this.#listFiles(),
			new Date(now.getTime() - authSettings.retentionMs.restoreJournal),
		);
		await Promise.all(
			expired.map(async (fileName) =>
				rm(path.join(authSettings.restoreJournalDirectory, fileName)),
			),
		);
	}

	async #listFiles(): Promise<string[]> {
		try {
			return await readdir(authSettings.restoreJournalDirectory);
		} catch (error) {
			// Aucune action encore journalisée : le dossier n'existe pas
			if (error instanceof Error && "code" in error && error.code === "ENOENT")
				return [];
			throw error;
		}
	}
}

export const restoreJournalService = new RestoreJournalService();
