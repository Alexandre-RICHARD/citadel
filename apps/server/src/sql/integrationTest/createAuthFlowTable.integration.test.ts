import { randomBytes } from "node:crypto";

import { DatabaseError, UniqueConstraintError } from "sequelize";
import { describe, expect, it } from "vitest";

import { sequelize } from "../../configuration/sequelize.ts";
import { insertAuthRows } from "../../testUtils/integration/auth/insertAuthRows.ts";
import { selectAuthRows } from "../../testUtils/integration/auth/selectAuthRows.ts";
import { buildUniqueWord } from "../../testUtils/integration/buildUniqueWord.ts";

// La migration V016
describe("createAuthFlowTable", () => {
	describe("default values", () => {
		it("SHOULD start with no attempt, no mail sent and no remember-me WHEN a flow is created", async () => {
			// Arrange
			const email = `${buildUniqueWord()}@example.com`;
			const payload = { username: "Alex", passwordHash: "argon2id:…" };
			const tokenHash = randomBytes(32);
			const expiresAt = new Date("2026-11-02T10:30:00.001Z");

			// Act
			const id = await insertAuthRows.flow({
				email,
				payload: JSON.stringify(payload),
				tokenHash,
				expiresAt,
			});

			// Assert
			expect(await selectAuthRows.flow(id)).toStrictEqual({
				id,
				tokenHash,
				kind: "registration",
				step: "mail_code",
				userId: null,
				email,
				payload,
				codeHmac: null,
				linkTokenHash: null,
				attempts: 0,
				sendCount: 0,
				remember: 0,
				lastSentAt: null,
				expiresAt,
			});
		});
	});

	describe("account", () => {
		it("SHOULD refuse a registration WHEN it is tied to an account", async () => {
			// Act
			const insertion = insertAuthRows.flow({
				kind: "registration",
				userId: await insertAuthRows.user(),
			});

			// Assert
			await expect(insertion).rejects.toThrow(DatabaseError);
		});

		// Chacun à une étape qu'il permet : seule l'absence de compte le fait refuser. Connexion par email et mot de passe
		// oublié l'acceptent depuis V020 (allowDecoyAuthFlows)
		it.each([
			{ kind: "login", step: "second_factor" },
			{ kind: "email_change", step: "mail_code" },
			{ kind: "email_factor", step: "mail_code" },
		])(
			"SHOULD refuse a $kind flow WHEN it has no account",
			async ({ kind, step }) => {
				// Act
				const insertion = insertAuthRows.flow({ kind, step, userId: null });

				// Assert
				await expect(insertion).rejects.toThrow(DatabaseError);
			},
		);

		it("SHOULD delete only the flows of the account WHEN the account is deleted", async () => {
			// Arrange
			const deletedUserId = await insertAuthRows.user();
			const otherUserId = await insertAuthRows.user();
			await insertAuthRows.flow({
				kind: "login",
				step: "second_factor",
				userId: deletedUserId,
			});
			const otherFlowId = await insertAuthRows.flow({
				kind: "mail_login",
				userId: otherUserId,
			});

			// Act
			await sequelize.query("DELETE FROM auth_user WHERE id = :id", {
				replacements: { id: deletedUserId },
			});

			// Assert
			expect(
				await selectAuthRows.rowIdsByUserId("auth_flow", deletedUserId),
			).toStrictEqual([]);
			expect(
				await selectAuthRows.rowIdsByUserId("auth_flow", otherUserId),
			).toStrictEqual([otherFlowId]);
		});
	});

	describe("steps", () => {
		const ALLOWED_STEPS_BY_KIND: Record<string, string[]> = {
			registration: ["mail_code"],
			login: ["second_factor"],
			mail_login: ["mail_code", "second_factor"],
			password_reset: ["mail_code", "second_factor", "new_password"],
			email_change: ["mail_code"],
			email_factor: ["mail_code"],
		};
		const ALL_STEPS = ["mail_code", "second_factor", "new_password"];
		const combinations = Object.entries(ALLOWED_STEPS_BY_KIND).flatMap(
			([kind, allowedSteps]) =>
				ALL_STEPS.map((step) => ({
					kind,
					step,
					isAllowed: allowedSteps.includes(step),
				})),
		);

		async function insertFlowAtStep(
			kind: string,
			step: string,
		): Promise<number> {
			const userId =
				kind === "registration" ? null : await insertAuthRows.user();
			return insertAuthRows.flow({ kind, step, userId });
		}

		it.each(combinations.filter(({ isAllowed }) => isAllowed))(
			"SHOULD accept the $step step WHEN a $kind flow goes through it",
			async ({ kind, step }) => {
				// Act
				const id = await insertFlowAtStep(kind, step);

				// Assert
				expect((await selectAuthRows.flow(id))?.step).toBe(step);
			},
		);

		it.each(combinations.filter(({ isAllowed }) => !isAllowed))(
			"SHOULD refuse the $step step WHEN a $kind flow never goes through it",
			async ({ kind, step }) => {
				// Act
				const insertion = insertFlowAtStep(kind, step);

				// Assert
				await expect(insertion).rejects.toThrow(DatabaseError);
			},
		);
	});

	describe("rejected values", () => {
		it("SHOULD refuse a flow WHEN another one already has its token hash", async () => {
			// Arrange
			const tokenHash = randomBytes(32);
			await insertAuthRows.flow({ tokenHash });

			// Act
			const insertion = insertAuthRows.flow({ tokenHash });

			// Assert
			await expect(insertion).rejects.toThrow(UniqueConstraintError);
		});

		it.each([
			{ column: "kind", value: "signup" },
			{ column: "step", value: "captcha" },
			{ column: "payload", value: "{not json" },
		])(
			"SHOULD refuse the $column WHEN it is $value",
			async ({ column, value }) => {
				// Act
				const insertion = insertAuthRows.flow({ [column]: value });

				// Assert
				await expect(insertion).rejects.toThrow(DatabaseError);
			},
		);

		it.each(["attempts", "send_count"])(
			"SHOULD refuse a negative %s",
			async (column) => {
				// Arrange
				const id = await insertAuthRows.flow();

				// Act
				const update = sequelize.query(
					`UPDATE auth_flow SET ${column} = -1 WHERE id = :id`,
					{
						replacements: { id },
					},
				);

				// Assert
				await expect(update).rejects.toThrow(DatabaseError);
			},
		);
	});

	describe("email", () => {
		it("SHOULD find the pending flow WHEN the same address is typed in another case", async () => {
			// Arrange
			const word = buildUniqueWord().toLowerCase();
			const id = await insertAuthRows.flow({
				email: `alex${word}@example.com`,
			});

			// Act
			const foundIds = await selectAuthRows.flowIdsByEmail(
				`Alex${word.toUpperCase()}@example.com`,
			);

			// Assert
			expect(foundIds).toStrictEqual([id]);
		});

		it("SHOULD not find the pending flow WHEN the address differs by an accent", async () => {
			// Arrange
			const word = buildUniqueWord().toLowerCase();
			await insertAuthRows.flow({ email: `jose${word}@example.com` });

			// Act
			const foundIds = await selectAuthRows.flowIdsByEmail(
				`josé${word}@example.com`,
			);

			// Assert
			expect(foundIds).toStrictEqual([]);
		});
	});
});
