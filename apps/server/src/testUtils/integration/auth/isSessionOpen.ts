import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";

import { app } from "../../../app.ts";

// La session de ce cookie ouvre-t-elle encore le compte ? Lu par GET /auth/me, comme le fait le front
export async function isSessionOpen(cookie: string): Promise<boolean> {
	const response = await request(app)
		.get(`${ApiPrefixEnum.AUTH}/me`)
		.set("Cookie", cookie);
	return response.status === Number(HttpStatutCodeSuccessEnum.SUCCESS);
}
