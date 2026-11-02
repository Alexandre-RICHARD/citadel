import { truncateIpForStorage } from "../../../common/network/truncateIpForStorage.ts";
import { logError } from "../../../error/logError.ts";
import type { CreateAuthEventBean } from "../bean/createAuthEventBean.type.ts";
import { createAuthEventQuery } from "../query/event/createAuthEventQuery.ts";

class AuthEventService {
	/**
	 * Note un événement de sécurité, IP tronquée (/24, /48). Le journal sert à comprendre après coup : son échec est
	 * loggé, jamais renvoyé, une connexion ne tombe pas pour lui
	 */
	async record({ type, userId, client }: CreateAuthEventBean): Promise<void> {
		try {
			await createAuthEventQuery({
				type,
				userId,
				ip: truncateIpForStorage(client.ip),
				userAgent: client.userAgent,
			});
		} catch (error) {
			await logError(error, "Journal de sécurité");
		}
	}
}

export const authEventService = new AuthEventService();
