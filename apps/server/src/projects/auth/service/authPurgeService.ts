import { authSettings } from "../../../configuration/authSettings.ts";
import { deleteAuthEventsBeforeQuery } from "../query/purge/deleteAuthEventsBeforeQuery.ts";
import { deleteExpiredFlowsQuery } from "../query/purge/deleteExpiredFlowsQuery.ts";
import { deleteExpiredSessionsQuery } from "../query/purge/deleteExpiredSessionsQuery.ts";
import { deleteUnconfirmedFactorsQuery } from "../query/purge/deleteUnconfirmedFactorsQuery.ts";

/**
 * Ce que l'authentification ne garde pas : déjà refusé à la lecture, effacé ici pour ne rien conserver de trop (RGPD).
 * Une purge par table : l'échec de l'une ne retarde pas les autres
 */
class AuthPurgeService {
	async purgeExpiredFlows(now: Date): Promise<void> {
		await deleteExpiredFlowsQuery(now);
	}

	async purgeExpiredSessions(now: Date): Promise<void> {
		await deleteExpiredSessionsQuery(now);
	}

	// Les facteurs dont le premier code n'a pas été validé à temps
	async purgeUnconfirmedFactors(now: Date): Promise<void> {
		await deleteUnconfirmedFactorsQuery(
			new Date(now.getTime() - authSettings.factorConfirmationMs),
		);
	}

	// Les événements de sécurité de plus de 20 jours : avec les sauvegardes, moins de 3 mois
	async purgeOldEvents(now: Date): Promise<void> {
		await deleteAuthEventsBeforeQuery(
			new Date(now.getTime() - authSettings.retentionMs.authEvent),
		);
	}
}

export const authPurgeService = new AuthPurgeService();
