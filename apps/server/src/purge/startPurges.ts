import { startRepeatingTask } from "@citadel/common/src/universal/async/startRepeatingTask.ts";

import { authSettings } from "../configuration/authSettings.ts";
import { logError } from "../error/logError.ts";
import { authPurgeService } from "../projects/auth/service/authPurgeService.ts";
import { errorLogService } from "../projects/errorLog/service/errorLogService.ts";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Les purges du serveur, lancées au démarrage puis répétées : un redémarrage (déploiement) les relance aussitôt. Dates
 * calculées par Node, jamais par NOW() en SQL. Renvoie de quoi les arrêter
 */
export function startPurges(): () => void {
	const stopFrequentPurge = startRepeatingTask({
		intervalMs: authSettings.purgeIntervalMs,
		task: async () => authPurgeService.purgeExpired(new Date()),
		onError: async (error) =>
			logError(error, "Purge des parcours, sessions et facteurs expirés"),
	});
	const stopDailyPurge = startRepeatingTask({
		intervalMs: DAY_MS,
		task: async () => {
			const now = new Date();
			await authPurgeService.purgeOldEvents(now);
			await errorLogService.purge(now, authSettings.retentionMs.errorLog);
		},
		onError: async (error) =>
			logError(error, "Purge des événements de sécurité et des erreurs"),
	});

	return () => {
		stopFrequentPurge();
		stopDailyPurge();
	};
}
