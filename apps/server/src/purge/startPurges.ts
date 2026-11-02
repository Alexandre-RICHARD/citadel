import { startRepeatingTask } from "@citadel/common/src/universal/async/startRepeatingTask.ts";
import { DurationMsEnum } from "@citadel/common/src/universal/date/durationMs.enum.ts";

import { authSettings } from "../configuration/authSettings.ts";
import { logError } from "../error/logError.ts";
import { authPurgeService } from "../projects/auth/service/authPurgeService.ts";
import { errorLogService } from "../projects/errorLog/service/errorLogService.ts";

type Purge = {
	// Le contexte de l'erreur dans les logs et error_log
	name: string;
	intervalMs: number;
	run: (now: Date) => Promise<void>;
};

const PURGES: Purge[] = [
	{
		name: "Purge des parcours expirés",
		intervalMs: authSettings.purgeIntervalMs,
		run: async (now) => authPurgeService.purgeExpiredFlows(now),
	},
	{
		name: "Purge des sessions expirées",
		intervalMs: authSettings.purgeIntervalMs,
		run: async (now) => authPurgeService.purgeExpiredSessions(now),
	},
	{
		name: "Purge des facteurs non confirmés",
		intervalMs: authSettings.purgeIntervalMs,
		run: async (now) => authPurgeService.purgeUnconfirmedFactors(now),
	},
	{
		name: "Purge des événements de sécurité",
		intervalMs: DurationMsEnum.DAY,
		run: async (now) => authPurgeService.purgeOldEvents(now),
	},
	{
		name: "Purge des erreurs du serveur",
		intervalMs: DurationMsEnum.DAY,
		run: async (now) =>
			errorLogService.purge(now, authSettings.retentionMs.errorLog),
	},
];

/**
 * Les purges du serveur, lancées au démarrage puis répétées : un redémarrage (déploiement) les relance aussitôt. Chacune
 * à part : l'échec de l'une ne retarde pas les autres. Dates calculées par Node, jamais par NOW() en SQL. Renvoie de
 * quoi les arrêter, résolu quand celles en cours ont fini
 */
export function startPurges(): () => Promise<void> {
	const stops = PURGES.map(({ name, intervalMs, run }) =>
		startRepeatingTask({
			intervalMs,
			task: async () => run(new Date()),
			onError: async (error) => logError(error, name),
		}),
	);

	return async () => {
		await Promise.all(stops.map(async (stop) => stop()));
	};
}
