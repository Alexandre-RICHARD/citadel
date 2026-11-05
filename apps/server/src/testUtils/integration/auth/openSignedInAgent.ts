import request from "supertest";

import { app } from "../../../app.ts";
import { openTestSession } from "./openTestSession.ts";

type SignedInAgent = {
	userId: number;
	// Chaque requête part avec le cookie de session du compte : `agent.get(url)` au lieu de `request(app).get(url)`
	agent: ReturnType<typeof request.agent>;
};

// Un compte neuf, connecté, pour les endpoints protégés des projets. Un autre appel donne un autre compte
export async function openSignedInAgent(): Promise<SignedInAgent> {
	const { userId, cookie } = await openTestSession();
	return { userId, agent: request.agent(app).set("Cookie", cookie) };
}
