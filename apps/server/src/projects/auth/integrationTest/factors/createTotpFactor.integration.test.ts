import type { TotpFactorSetupDto } from "@citadel/specs/src/projects/auth/dto/totpFactorSetupDto.type.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { TechnicalErrorCodeEnum } from "@citadel/specs/src/specUtils/error/technicalErrorCode.enum.ts";
import { ValidationIssueCodeEnum } from "@citadel/specs/src/specUtils/error/validationIssueCode.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { insertTestAccount } from "../../../../testUtils/integration/auth/insertTestAccount.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { expectValidationError } from "../../../../testUtils/integration/expectValidationError.ts";
import { encodeBase32 } from "../../totp/encodeBase32.ts";

const CREATE_TOTP_URL = `${ApiPrefixEnum.AUTH}/factors/totp`;

async function createTotp(body: { name: unknown }, cookie?: string) {
	const pending = request(app).post(CREATE_TOTP_URL).send(body);
	return cookie === undefined ? pending : pending.set("Cookie", cookie);
}

describe("createTotpFactor", () => {
	describe("201 Created", () => {
		it("SHOULD give the secret once and keep it encrypted, waiting for its first code", async () => {
			// Arrange
			const account = await insertTestAccount();
			const session = await openTestSession({ userId: account.userId });

			// Act
			const response = await createTotp(
				{ name: "  Mon   téléphone " },
				session.cookie,
			);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.CREATED);
			expect(response.headers["cache-control"]).toBe("no-store");
			const setup = response.body as TotpFactorSetupDto;
			expect(setup.secret).toMatch(/^[A-Z2-7]{32}$/u);
			expect(setup.otpauthUri).toBe(
				`otpauth://totp/Citadel:${encodeURIComponent(account.email)}?secret=${setup.secret}&issuer=Citadel&algorithm=SHA1&digits=6&period=30`,
			);
			const factor = await selectAuthRows.factor(setup.factorId);
			expect(factor).toMatchObject({
				userId: account.userId,
				type: "totp",
				name: "Mon téléphone",
				keyVersion: 1,
				lastUsedStep: null,
				confirmedAt: null,
			});
			// Ni en clair, ni en Base32
			const stored = factor?.secretEncrypted ?? Buffer.alloc(0);
			expect(stored.toString("latin1")).not.toContain(setup.secret);
			expect(encodeBase32(stored)).not.toContain(setup.secret);
		});

		it("SHOULD give another secret WHEN a second TOTP is added", async () => {
			// Arrange
			const session = await openTestSession();
			const first = await createTotp({ name: "Téléphone" }, session.cookie);

			// Act
			const second = await createTotp({ name: "Tablette" }, session.cookie);

			// Assert
			expect((second.body as TotpFactorSetupDto).secret).not.toBe(
				(first.body as TotpFactorSetupDto).secret,
			);
		});
	});

	describe("400 Bad Request", () => {
		it.each([
			{
				reason: "an empty name",
				name: " ",
				code: ValidationIssueCodeEnum.TOO_SHORT,
				message: "Factor name should contain at least 1 character",
				limit: 1,
			},
			{
				reason: "a name of 51 characters",
				name: "a".repeat(51),
				code: ValidationIssueCodeEnum.TOO_LONG,
				message: "Factor name should contain at most 50 characters",
				limit: 50,
			},
		])("SHOULD refuse $reason", async ({ name, code, message, limit }) => {
			// Arrange
			const session = await openTestSession();

			// Act
			const response = await createTotp({ name }, session.cookie);

			// Assert
			expectValidationError(response, [
				{ path: ["name"], code, message, limit },
			]);
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await createTotp({ name: "Téléphone" });

			// Assert
			expect(response.status).toBe(
				HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION,
			);
			expect((response.body as { code: string }).code).toBe(
				TechnicalErrorCodeEnum.AUTHENTICATION_REQUIRED,
			);
		});
	});
});
