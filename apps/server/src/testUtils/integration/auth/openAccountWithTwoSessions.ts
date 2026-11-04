import { openTestSession } from "./openTestSession.ts";

// Un compte connecté depuis deux appareils : « here » fait les requêtes, « phone » est l'autre session
export async function openAccountWithTwoSessions() {
	const here = await openTestSession();
	const phone = await openTestSession({ userId: here.userId });
	return { here, phone };
}
