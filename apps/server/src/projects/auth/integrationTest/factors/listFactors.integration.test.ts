import type { FactorListDto } from "@citadel/specs/src/projects/auth/dto/factorListDto.type.ts";
import { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum.ts";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum.ts";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum.ts";
import { HttpStatutCodeSuccessEnum } from "@citadel/specs/src/specUtils/httpStatutCodeSuccess.enum.ts";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "../../../../app.ts";
import { insertAuthRows } from "../../../../testUtils/integration/auth/insertAuthRows.ts";
import { insertTestTotpFactor } from "../../../../testUtils/integration/auth/insertTestTotpFactor.ts";
import { openTestSession } from "../../../../testUtils/integration/auth/openTestSession.ts";

const LIST_FACTORS_URL = `${ApiPrefixEnum.AUTH}/factors`;

describe("listFactors", () => {
	describe("200 OK", () => {
		it("SHOULD list the active factors of the account, oldest first, with the unused recovery codes, never a secret", async () => {
			// Arrange
			const session = await openTestSession();
			const { userId } = session;
			const emailFactorId = await insertAuthRows.factor({
				userId,
				confirmedAt: new Date(),
				createdAt: new Date("2026-11-01T10:00:00.000Z"),
			});
			const totp = await insertTestTotpFactor({
				userId,
				createdAt: new Date("2026-11-02T10:00:00.000Z"),
			});
			// En attente de son premier code, puis le facteur d'un autre compte : absents de la liste
			await insertTestTotpFactor({ userId, confirmedAt: null });
			await insertTestTotpFactor({ userId: await insertAuthRows.user() });
			await insertAuthRows.recoveryCode({ userId });
			await insertAuthRows.recoveryCode({ userId });
			await insertAuthRows.recoveryCode({ userId, usedAt: new Date() });

			// Act
			const response = await request(app)
				.get(LIST_FACTORS_URL)
				.set("Cookie", session.cookie);

			// Assert
			expect(response.status).toBe(HttpStatutCodeSuccessEnum.SUCCESS);
			expect(response.headers["cache-control"]).toBe("no-store");
			expect(response.body as FactorListDto).toStrictEqual({
				factors: [
					{
						id: emailFactorId,
						type: FactorTypeEnum.EMAIL,
						name: "Mon facteur",
						createdAt: "2026-11-01T10:00:00.000Z",
						lastUsedAt: null,
					},
					{
						id: totp.factorId,
						type: FactorTypeEnum.TOTP,
						name: "Mon facteur",
						createdAt: "2026-11-02T10:00:00.000Z",
						lastUsedAt: null,
					},
				],
				remainingRecoveryCodes: 2,
			});
		});
	});

	describe("401 Unauthorized", () => {
		it("SHOULD refuse WHEN there is no session", async () => {
			// Act
			const response = await request(app).get(LIST_FACTORS_URL);

			// Assert
			expect(response.status).toBe(
				HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION,
			);
		});
	});
});
