import { randomBytes } from "node:crypto";

import { FlowKindEnum } from "@citadel/specs/src/projects/auth/enum/flowKind.enum.ts";
import { FlowStepEnum } from "@citadel/specs/src/projects/auth/enum/flowStep.enum.ts";
import { describe, expect, it } from "vitest";

import { insertAuthRows } from "../../../../testUtils/integration/auth/insertAuthRows.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { buildUniqueWord } from "../../../../testUtils/integration/buildUniqueWord.ts";
import { selectEnumColumnValues } from "../../../../testUtils/integration/selectEnumColumnValues.ts";
import { Flow } from "../../models/Flow.ts";

describe("flowModel", () => {
	describe("columns", () => {
		it("SHOULD write every column and read it back WHEN every attribute is given", async () => {
			// Arrange
			const attributes = {
				tokenHash: randomBytes(32),
				kind: FlowKindEnum.EMAIL_CHANGE,
				step: FlowStepEnum.MAIL_CODE,
				userId: await insertAuthRows.user(),
				email: `${buildUniqueWord()}@example.com`,
				payload: { newEmail: "josé@example.com" },
				codeHmac: randomBytes(32),
				linkTokenHash: randomBytes(32),
				attempts: 2,
				sendCount: 3,
				remember: true,
				lastSentAt: new Date("2026-11-02T10:00:00.001Z"),
				expiresAt: new Date("2026-11-02T10:30:00.002Z"),
			};

			// Act
			const { id } = await Flow.create(attributes);
			const flow = await Flow.findByPk(id);

			// Assert : base, où un booléen est un TINYINT
			expect(await selectAuthRows.flow(id)).toStrictEqual({
				id,
				...attributes,
				remember: 1,
			});

			// Assert : modèle
			expect(flow?.get()).toStrictEqual({
				id,
				...attributes,
				createdAt: expect.any(Date) as Date,
				updatedAt: expect.any(Date) as Date,
			});
		});

		it("SHOULD start with no attempt, no mail sent, no payload and no remember-me WHEN only the required attributes are given", async () => {
			// Act
			const { id } = await Flow.create({
				tokenHash: randomBytes(32),
				kind: FlowKindEnum.REGISTRATION,
				step: FlowStepEnum.MAIL_CODE,
				userId: null,
				email: `${buildUniqueWord()}@example.com`,
				expiresAt: new Date(),
			});
			const flow = await Flow.findByPk(id);

			// Assert
			expect(flow?.get()).toMatchObject({
				payload: null,
				codeHmac: null,
				linkTokenHash: null,
				attempts: 0,
				sendCount: 0,
				remember: false,
				lastSentAt: null,
			});
		});
	});

	describe("schema", () => {
		it.each([
			{ column: "kind", enumValues: Object.values(FlowKindEnum) },
			{ column: "step", enumValues: Object.values(FlowStepEnum) },
		])(
			"SHOULD allow exactly the values of its enum WHEN the $column column is read",
			async ({ column, enumValues }) => {
				// Act
				const values = await selectEnumColumnValues("auth_flow", column);

				// Assert
				expect(values).toStrictEqual(enumValues);
			},
		);
	});
});
