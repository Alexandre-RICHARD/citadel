import { runInTransaction } from "../../../../common/database/runInTransaction.ts";
import { Session } from "../../models/Session.ts";
import { User } from "../../models/User.ts";

type SessionRow = {
	userId: number;
	tokenHash: Buffer;
	remember: boolean;
	userAgent: string | null;
	ip: string;
	seenAt: Date;
	expiresAt: Date;
	absoluteExpiresAt: Date;
};

// Crée la session et note la visite du compte, ensemble
export async function createSessionQuery(row: SessionRow): Promise<Session> {
	return runInTransaction("Failed to create session", async (transaction) => {
		const session = await Session.create(
			{
				userId: row.userId,
				tokenHash: row.tokenHash,
				remember: row.remember,
				userAgent: row.userAgent,
				ip: row.ip,
				lastSeenAt: row.seenAt,
				expiresAt: row.expiresAt,
				absoluteExpiresAt: row.absoluteExpiresAt,
			},
			{ transaction },
		);
		await User.update(
			{ lastSeenAt: row.seenAt },
			{ where: { id: row.userId }, transaction },
		);
		return session;
	});
}
