import { runInTransaction } from "../../../../common/database/runInTransaction.ts";
import { Session } from "../../models/Session.ts";
import { User } from "../../models/User.ts";

type Prolongation = {
	sessionId: number;
	userId: number;
	seenAt: Date;
	expiresAt: Date;
};

// Repousse la fin de la session et note la visite, sur la session et sur le compte
export async function prolongSessionQuery({
	sessionId,
	userId,
	seenAt,
	expiresAt,
}: Prolongation): Promise<void> {
	await runInTransaction("Failed to prolong session", async (transaction) => {
		await Session.update(
			{ lastSeenAt: seenAt, expiresAt },
			{ where: { id: sessionId }, transaction },
		);
		await User.update(
			{ lastSeenAt: seenAt },
			{ where: { id: userId }, transaction },
		);
	});
}
