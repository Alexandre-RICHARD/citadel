import { authSettings } from "../../../configuration/authSettings.ts";
import { deleteAuthEventsBeforeQuery } from "../query/purge/deleteAuthEventsBeforeQuery.ts";
import { deleteExpiredFlowsQuery } from "../query/purge/deleteExpiredFlowsQuery.ts";
import { deleteExpiredSessionsQuery } from "../query/purge/deleteExpiredSessionsQuery.ts";
import { deleteUnconfirmedFactorsQuery } from "../query/purge/deleteUnconfirmedFactorsQuery.ts";

// Ce que l'authentification ne garde pas : déjà refusé à la lecture, effacé ici pour ne rien conserver de trop (RGPD)
class AuthPurgeService {
	// Toutes les 15 minutes : parcours et sessions expirés, facteurs jamais confirmés
	async purgeExpired(now: Date): Promise<void> {
		await deleteExpiredFlowsQuery(now);
		await deleteExpiredSessionsQuery(now);
		await deleteUnconfirmedFactorsQuery(
			new Date(now.getTime() - authSettings.factorConfirmationMs),
		);
	}

	// Une fois par jour : les événements de sécurité de plus de 20 jours (avec les sauvegardes, moins de 3 mois)
	async purgeOldEvents(now: Date): Promise<void> {
		await deleteAuthEventsBeforeQuery(
			new Date(now.getTime() - authSettings.retentionMs.authEvent),
		);
	}
}

export const authPurgeService = new AuthPurgeService();
