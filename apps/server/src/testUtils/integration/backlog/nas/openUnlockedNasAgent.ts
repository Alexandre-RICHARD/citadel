import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { expect } from "vitest";

import { app } from "../../../../app.ts";
import { unlockCookie } from "../../../../projects/backlog/nas/access/unlockCookie.ts";
import { readCookieHeader } from "../../auth/readCookieHeader.ts";
import { buildUniqueIp } from "../../buildUniqueIp.ts";
import { NAS_TEST_PASSWORD } from "./nasTestPassword.ts";
import { openNasOwnerSession } from "./openNasOwnerSession.ts";

type NasAgent = {
	userId: number;
	// La session du compte, sans le déverrouillage
	sessionCookie: string;
	// Chaque requête part avec la session et le cookie de déverrouillage
	agent: ReturnType<typeof request.agent>;
};

// Le propriétaire du NAS, connecté et déverrouillé par le mot de passe des médias
export async function openUnlockedNasAgent(): Promise<NasAgent> {
	const { userId, cookie } = await openNasOwnerSession();
	const response = await request(app)
		.post(`${ApiPrefixEnum.BACKLOG}/nas/unlock`)
		.set("Cookie", cookie)
		.set("X-Real-IP", buildUniqueIp())
		.send({ password: NAS_TEST_PASSWORD });
	expect(response.status).toBe(HttpStatutCodeSuccessEnum.NO_CONTENT);
	const unlock = readCookieHeader(response, unlockCookie.name) ?? "";
	return {
		userId,
		sessionCookie: cookie,
		agent: request.agent(app).set("Cookie", `${cookie}; ${unlock}`),
	};
}
