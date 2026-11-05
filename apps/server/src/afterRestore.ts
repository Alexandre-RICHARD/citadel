import "./configuration/timezone.ts";

import { z } from "zod";

import { sequelize } from "./configuration/sequelize.ts";
import { describeError } from "./error/describeError.ts";
import { selectLinesToReplay } from "./projects/auth/helper/restoreJournal/selectLinesToReplay.ts";
import { restoreJournalService } from "./projects/auth/service/restoreJournalService.ts";
import { restoreReplayService } from "./projects/auth/service/restoreReplayService.ts";

/* eslint-disable no-console -- une commande : sa sortie est son compte rendu, lu dans le terminal de citadel restore-db */

// La date de la sauvegarde restaurée, avec son fuseau : 2026-11-05T03:00:00+01:00
const backupDateSchema = z.iso
	.datetime({ offset: true })
	.transform((date) => new Date(date));

/**
 * La commande « après restauration » (cahier de l'authentification, §10.5), lancée par citadel restore-db, serveur
 * arrêté, base tout juste restaurée : `node build/afterRestore.cjs <date de la sauvegarde>`. Les sessions et les
 * parcours d'abord (une session révoquée depuis la sauvegarde y est encore), puis le journal rejoué
 */
async function afterRestore(): Promise<void> {
	const backupDate = backupDateSchema.safeParse(process.argv[2]);
	if (!backupDate.success)
		throw new Error(
			"usage : node build/afterRestore.cjs <date de la sauvegarde, ex. 2026-11-05T03:00:00+01:00>",
		);
	await sequelize.authenticate();

	const closed = await restoreReplayService.closeEverySessionAndFlow();
	console.log(
		`  sessions fermées : ${closed.sessions} ; parcours effacés : ${closed.flows}`,
	);

	const { lines, unreadableCount } = await restoreJournalService.readAll();
	const toReplay = selectLinesToReplay(lines, backupDate.data);
	const report = await restoreReplayService.replay(toReplay);
	console.log(
		`  journal depuis le ${backupDate.data.toISOString()} : ${toReplay.length} ligne(s), ${report.replayed} rejouée(s), ${report.skippedMissingAccount} sur un compte absent de la sauvegarde`,
	);
	console.log(`  mots de passe invalidés : ${report.invalidatedPasswords}`);
	if (report.emailConflicts > 0)
		console.log(
			`  attention : ${report.emailConflicts} changement(s) d'email non refait(s), l'adresse appartient à un autre compte`,
		);
	if (unreadableCount > 0)
		console.log(
			`  attention : ${unreadableCount} ligne(s) illisible(s) du journal laissée(s) de côté`,
		);
}

afterRestore()
	.then(async () => sequelize.close())
	.catch(async (error: unknown) => {
		// describeError : ni paramètre SQL (l'adresse d'un changement d'email rejoué), ni autre propriété de l'erreur
		console.error(
			"Échec de la commande « après restauration » :",
			describeError(error),
		);
		await sequelize.close();
		process.exit(1);
	});
