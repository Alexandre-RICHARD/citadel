import type { FlowStatusDto } from "@citadel/specs/src/projects/auth/dto/flowStatusDto.type.ts";
import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { useFakeClock } from "../../../../testUtils/clock/useFakeClock.ts";
import { insertAuthRows } from "../../../../testUtils/integration/auth/insertAuthRows.ts";
import { openTestFlow } from "../../../../testUtils/integration/auth/openTestFlow.ts";
import { readSetCookie } from "../../../../testUtils/integration/auth/readSetCookie.ts";
import { flowCookie } from "../../cookie/flowCookie.ts";

const GET_FLOW_URL = `${ApiPrefixEnum.AUTH}/flow`;
const MINUTE_MS = 60 * 1000;

async function getFlow(cookie?: string) {
	const pending = request(app).get(GET_FLOW_URL);
	return cookie === undefined ? pending : pending.set("Cookie", cookie);
}

describe("getFlow", () => {
	describe("200 OK", () => {
		it("SHOULD say where the flow stands, never cached, WHEN the browser has one", async () => {
			// Arrange
			const clock = useFakeClock();
			const flow = await openTestFlow({
				expiresAt: new Date(Date.now() + 30 * MINUTE_MS),
				attempts: 2,
			});
			clock.advance(20 * 1000);

			// Act
			const response = await getFlow(flow.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.headers["cache-control"]).toBe("no-store");
			expect(response.body as FlowStatusDto).toStrictEqual({
				flow: {
					kind: FlowKindEnum.REGISTRATION,
					step: FlowStepEnum.MAIL_CODE,
					expiresIn: 30 * 60 - 20,
					resendRetryAfter: 40,
					remainingAttempts: 3,
				},
			});
		});

		it("SHOULD read a decoy exactly like a real flow WHEN nobody owns the identifier", async () => {
			// Arrange
			const clock = useFakeClock();
			const user = await insertAuthRows.user();
			const real = await openTestFlow({ kind: "mail_login", userId: user });
			const decoy = await openTestFlow({
				kind: "mail_login",
				userId: null,
				hasSecrets: false,
			});
			clock.advance(5 * 1000);

			// Act
			const realResponse = await getFlow(real.cookie);
			const decoyResponse = await getFlow(decoy.cookie);

			// Assert
			expect(decoyResponse.body).toStrictEqual(realResponse.body);
		});

		it("SHOULD give no wait before a resend WHEN the step sends no mail", async () => {
			// Arrange
			const flow = await openTestFlow({
				kind: "login",
				step: "second_factor",
				userId: await insertAuthRows.user(),
				hasSecrets: false,
				lastSentAt: null,
			});

			// Act
			const response = await getFlow(flow.cookie);

			// Assert
			expect((response.body as FlowStatusDto).flow).toMatchObject({
				kind: FlowKindEnum.LOGIN,
				step: FlowStepEnum.SECOND_FACTOR,
				resendRetryAfter: null,
			});
		});

		it("SHOULD give no flow, without touching cookies, WHEN the browser has no flow cookie", async () => {
			// Act
			const response = await getFlow();

			// Assert
			expect(response.body as FlowStatusDto).toStrictEqual({ flow: null });
			expect(readSetCookie(response, flowCookie.name)).toBeUndefined();
		});

		it("SHOULD give no flow and clear the cookie WHEN the flow is unknown", async () => {
			// Act
			const response = await getFlow(`${flowCookie.name}=inconnu`);

			// Assert
			expect(response.body as FlowStatusDto).toStrictEqual({ flow: null });
			expect(readSetCookie(response, flowCookie.name)).toContain(
				"Expires=Thu, 01 Jan 1970",
			);
		});

		it("SHOULD give no flow and clear the cookie WHEN the flow expired", async () => {
			// Arrange
			const clock = useFakeClock();
			const flow = await openTestFlow({
				expiresAt: new Date(Date.now() + MINUTE_MS),
			});
			clock.advance(MINUTE_MS);

			// Act
			const response = await getFlow(flow.cookie);

			// Assert
			expect(response.body as FlowStatusDto).toStrictEqual({ flow: null });
			expect(readSetCookie(response, flowCookie.name)).toContain(
				"Expires=Thu, 01 Jan 1970",
			);
		});
	});
});
