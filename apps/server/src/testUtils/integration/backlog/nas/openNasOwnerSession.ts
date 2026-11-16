import { vi } from "vitest";

import { nasOwner } from "../../../../projects/backlog/nas/access/nasOwner.ts";
import { openTestSession } from "../../auth/openTestSession.ts";

// Un compte neuf, désigné propriétaire du NAS pour ce test (les espions sont remis à zéro après chaque test)
export async function openNasOwnerSession(): Promise<{
	userId: number;
	cookie: string;
}> {
	const session = await openTestSession();
	vi.spyOn(nasOwner, "isOwner").mockImplementation(
		(_settings, userId) => userId === session.userId,
	);
	return session;
}
