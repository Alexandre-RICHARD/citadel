import { createRandomToken } from "@citadel/common/src/node/crypto/createRandomToken.ts";
import { hashSha256 } from "@citadel/common/src/node/crypto/hashSha256.ts";

import { truncateIpForStorage } from "../../../common/network/truncateIpForStorage.ts";
import { authSettings } from "../../../configuration/authSettings.ts";
import type { AuthenticatedSessionBean } from "../bean/authenticatedSessionBean.type.ts";
import type { CreateSessionBean } from "../bean/createSessionBean.type.ts";
import type { SessionBean } from "../bean/sessionBean.type.ts";
import type { SessionCookieBean } from "../bean/sessionCookieBean.type.ts";
import { computeSessionExpiresAt } from "../helper/session/computeSessionExpiresAt.ts";
import { isSessionDueForProlongation } from "../helper/session/isSessionDueForProlongation.ts";
import { fromSessionEntityToSessionBean } from "../mapper/beanEntity/session/fromSessionEntityToSessionBean.ts";
import { createSessionQuery } from "../query/session/createSessionQuery.ts";
import { deleteOtherSessionsOfUserQuery } from "../query/session/deleteOtherSessionsOfUserQuery.ts";
import { deleteSessionByTokenHashQuery } from "../query/session/deleteSessionByTokenHashQuery.ts";
import { deleteSessionOfUserQuery } from "../query/session/deleteSessionOfUserQuery.ts";
import { deleteSessionsOfUserQuery } from "../query/session/deleteSessionsOfUserQuery.ts";
import { findSessionByTokenHashQuery } from "../query/session/findSessionByTokenHashQuery.ts";
import { findSessionsOfUserQuery } from "../query/session/findSessionsOfUserQuery.ts";
import { prolongSessionQuery } from "../query/session/prolongSessionQuery.ts";

/**
 * Sessions opaques : le cookie porte un jeton de 32 octets tirés au hasard, la base n'en garde que le SHA-256 (une fuite
 * de la base ne donne aucune session). Les dates sont calculées ici, jamais par NOW() en SQL
 */
class SessionService {
	async create({
		userId,
		remember,
		client,
		replacedToken,
	}: CreateSessionBean): Promise<SessionCookieBean> {
		const token = createRandomToken();
		const now = new Date();
		const absoluteExpiresAt = new Date(
			now.getTime() + authSettings.session.absoluteMs,
		);
		const expiresAt = computeSessionExpiresAt(
			{ remember, seenAt: now, absoluteExpiresAt },
			authSettings.session,
		);

		await createSessionQuery({
			userId,
			tokenHash: hashSha256(token),
			remember,
			userAgent: client.userAgent,
			ip: truncateIpForStorage(client.ip),
			seenAt: now,
			expiresAt,
			absoluteExpiresAt,
			replacedTokenHash:
				replacedToken === undefined ? null : hashSha256(replacedToken),
		});
		return { token, remember, expiresAt };
	}

	/**
	 * La session du jeton, si elle n'a pas expiré (inactivité ou plafond : expires_at ne dépasse jamais le plafond) ;
	 * prolongée au passage quand la dernière visite notée a 5 minutes. null : pas de session valide
	 */
	async authenticate(token: string): Promise<AuthenticatedSessionBean | null> {
		const session = await findSessionByTokenHashQuery(hashSha256(token));
		const now = new Date();
		if (session === null || session.expiresAt <= now) return null;

		const authenticatedSession = {
			sessionId: session.id,
			userId: session.userId,
			remember: session.remember,
			expiresAt: session.expiresAt,
			isProlonged: false,
		};
		if (
			!isSessionDueForProlongation(
				session.lastSeenAt,
				now,
				authSettings.session.touchMs,
			)
		)
			return authenticatedSession;

		const expiresAt = computeSessionExpiresAt(
			{
				remember: session.remember,
				seenAt: now,
				absoluteExpiresAt: session.absoluteExpiresAt,
			},
			authSettings.session,
		);
		await prolongSessionQuery({
			sessionId: session.id,
			userId: session.userId,
			seenAt: now,
			expiresAt,
		});
		return { ...authenticatedSession, expiresAt, isProlonged: true };
	}

	// Le jeton ne marche plus, immédiatement. Sans effet sur un jeton inconnu
	async delete(token: string): Promise<void> {
		await deleteSessionByTokenHashQuery(hashSha256(token));
	}

	// Les sessions encore valables du compte, avec celle de la requête repérée
	async list(userId: number, currentSessionId: number): Promise<SessionBean[]> {
		const sessions = await findSessionsOfUserQuery(userId, new Date());
		return sessions.map((session) =>
			fromSessionEntityToSessionBean(session, currentSessionId),
		);
	}

	// Une session du compte, jamais celle d'un autre. false : aucune session de ce compte sous cet id
	async deleteOfUser(userId: number, sessionId: number): Promise<boolean> {
		return deleteSessionOfUserQuery({ userId, sessionId });
	}

	// Toutes les sessions du compte, celle de la requête comprise
	async deleteAllOfUser(userId: number): Promise<void> {
		await deleteSessionsOfUserQuery(userId);
	}

	// Toutes les sessions du compte sauf celle de la requête
	async deleteOthersOfUser(
		userId: number,
		keptSessionId: number,
	): Promise<void> {
		await deleteOtherSessionsOfUserQuery({ userId, keptSessionId });
	}
}

export const sessionService = new SessionService();
