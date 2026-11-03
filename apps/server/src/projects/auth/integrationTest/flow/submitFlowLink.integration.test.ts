import type { FlowStatusDto } from "@citadel/specs/src/projects/auth/dto/flowStatusDto.type.ts";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { useFakeClock } from "../../../../testUtils/clock/useFakeClock.ts";
import { insertAuthRows } from "../../../../testUtils/integration/auth/insertAuthRows.ts";
import { insertTestAccount } from "../../../../testUtils/integration/auth/insertTestAccount.ts";
import { openTestFlow } from "../../../../testUtils/integration/auth/openTestFlow.ts";
import { readSetCookie } from "../../../../testUtils/integration/auth/readSetCookie.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { buildUniqueWord } from "../../../../testUtils/integration/buildUniqueWord.ts";
import { expectConflict } from "../../../../testUtils/integration/expectConflict.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { sessionCookie } from "../../cookie/sessionCookie.ts";

const SUBMIT_LINK_URL = `${ApiPrefixEnum.AUTH}/flow/link`;
const MINUTE_MS = 60 * 1000;
const PASSWORD_HASH = "argon2id:m=64,t=1,p=1:c2Vs:aGFzaA";

async function submitLink(
	body: { token: string; username?: string },
	cookie?: string,
) {
	const pending = request(app).post(SUBMIT_LINK_URL).send(body);
	return cookie === undefined ? pending : pending.set("Cookie", cookie);
}

async function openRegistration() {
	const username = buildUniqueWord();
	const flow = await openTestFlow({
		payload: { username, passwordHash: PASSWORD_HASH },
	});
	return { ...flow, username };
}

function expectRejected(
	response: request.Response,
	code: AuthErrorCodeEnum,
	message: string,
): void {
	expect(response.status).toBe(HttpStatutCodeErrorEnum.BAD_REQUEST);
	expect(response.body).toStrictEqual({ code, message });
}

describe("submitFlowLink", () => {
	describe("200 OK", () => {
		it("SHOULD create the account and open the session WHEN the link is confirmed in the browser of the flow", async () => {
			// Arrange
			const flow = await openRegistration();

			// Act
			const response = await submitLink({ token: flow.linkToken }, flow.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body as FlowStatusDto).toStrictEqual({ flow: null });
			expect(await selectAuthRows.userIdsByEmail(flow.email)).toHaveLength(1);
			expect(readSetCookie(response, sessionCookie.name)).toBeDefined();
		});

		it("SHOULD open the session WHEN the link of the email code of a login is confirmed", async () => {
			// Arrange
			const account = await insertTestAccount({ confirmedFactorType: "email" });
			const flow = await openTestFlow({
				kind: "login",
				step: "second_factor",
				userId: account.userId,
				email: account.email,
			});

			// Act
			const response = await submitLink({ token: flow.linkToken }, flow.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.body as FlowStatusDto).toStrictEqual({ flow: null });
			expect(readSetCookie(response, sessionCookie.name)).toBeDefined();
			expect(await selectAuthRows.flow(flow.id)).toBeNull();
		});

		it("SHOULD keep the link valid WHEN the username was taken in the meantime, then accept a new one", async () => {
			// Arrange
			const flow = await openRegistration();
			await insertAuthRows.user({ username: flow.username });

			// Act
			const conflict = await submitLink({ token: flow.linkToken }, flow.cookie);
			const retry = await submitLink(
				{ token: flow.linkToken, username: buildUniqueWord() },
				flow.cookie,
			);

			// Assert
			expectConflict(
				conflict,
				AuthErrorCodeEnum.USERNAME_TAKEN,
				"The username was taken in the meantime",
			);
			expect(retry.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
		});
	});

	describe("400 Bad Request", () => {
		it("SHOULD refuse with LINK_OTHER_BROWSER, creating nothing, WHEN the link is opened in another browser", async () => {
			// Arrange : un autre navigateur, avec son propre parcours ou sans
			const flow = await openRegistration();
			const otherBrowserFlow = await openTestFlow();

			// Act
			const withoutFlow = await submitLink({ token: flow.linkToken });
			const withOtherFlow = await submitLink(
				{ token: flow.linkToken },
				otherBrowserFlow.cookie,
			);

			// Assert
			for (const response of [withoutFlow, withOtherFlow])
				expectRejected(
					response,
					AuthErrorCodeEnum.LINK_OTHER_BROWSER,
					"The link belongs to a flow started in another browser",
				);
			expect(await selectAuthRows.userIdsByEmail(flow.email)).toStrictEqual([]);
			expect(await selectAuthRows.flow(flow.id)).not.toBeNull();
		});

		it("SHOULD refuse with FLOW_EXPIRED WHEN the email factor was removed since the email code left", async () => {
			// Arrange : le compte n'a plus qu'un TOTP
			const account = await insertTestAccount({ confirmedFactorType: "totp" });
			const flow = await openTestFlow({
				kind: "login",
				step: "second_factor",
				userId: account.userId,
				email: account.email,
			});

			// Act
			const response = await submitLink({ token: flow.linkToken }, flow.cookie);

			// Assert
			expectRejected(
				response,
				AuthErrorCodeEnum.FLOW_EXPIRED,
				"The account no longer has its email factor",
			);
			expect(readSetCookie(response, sessionCookie.name)).toBeUndefined();
		});

		it("SHOULD refuse with FLOW_EXPIRED WHEN the link was already used", async () => {
			// Arrange
			const flow = await openRegistration();
			await submitLink({ token: flow.linkToken }, flow.cookie);

			// Act
			const response = await submitLink({ token: flow.linkToken }, flow.cookie);

			// Assert
			expectRejected(
				response,
				AuthErrorCodeEnum.FLOW_EXPIRED,
				"Unknown, used, replaced or expired link",
			);
		});

		it("SHOULD refuse with FLOW_EXPIRED WHEN the flow expired", async () => {
			// Arrange
			const clock = useFakeClock();
			const flow = await openTestFlow({
				expiresAt: new Date(Date.now() + MINUTE_MS),
			});
			clock.advance(MINUTE_MS);

			// Act
			const response = await submitLink({ token: flow.linkToken }, flow.cookie);

			// Assert
			expectRejected(
				response,
				AuthErrorCodeEnum.FLOW_EXPIRED,
				"Unknown, used, replaced or expired link",
			);
		});

		it("SHOULD refuse a token WHEN it is not 43 base64url characters", async () => {
			// Act
			const response = await submitLink({ token: "trop-court" });

			// Assert
			expectValidationError(response, [
				{
					path: ["token"],
					code: ValidationIssueCodeEnum.INVALID_FORMAT,
					message: "Token should be 43 base64url characters",
				},
			]);
		});
	});
});
