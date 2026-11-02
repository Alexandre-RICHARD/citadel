import { describe, expect, it } from "vitest";

import { insertAuthRows } from "../../../../testUtils/integration/auth/insertAuthRows.ts";
import { selectAuthRows } from "../../../../testUtils/integration/auth/selectAuthRows.ts";
import { AuthEvent } from "../../models/AuthEvent.ts";

describe("authEventModel", () => {
	describe("columns", () => {
		it.each([
			{
				reason: "it belongs to an account",
				userAgent: "Mozilla/5.0 (Android 15) Chrome/140.0",
				hasAccount: true,
			},
			{ reason: "no account was found", userAgent: null, hasAccount: false },
		])(
			"SHOULD write every column and read it back WHEN $reason",
			async ({ userAgent, hasAccount }) => {
				// Arrange
				const attributes = {
					userId: hasAccount ? await insertAuthRows.user() : null,
					type: "login_failure",
					ip: "203.0.113.0",
					userAgent,
				};

				// Act
				const { id } = await AuthEvent.create(attributes);
				const event = await AuthEvent.findByPk(id);

				// Assert : base
				expect(await selectAuthRows.event(id)).toStrictEqual({
					id,
					...attributes,
				});

				// Assert : modèle
				expect(event?.get()).toStrictEqual({
					id,
					...attributes,
					createdAt: expect.any(Date) as Date,
					updatedAt: expect.any(Date) as Date,
				});
			},
		);

		it("SHOULD keep the first 255 characters WHEN the user agent is longer than the column", async () => {
			// Arrange
			const longUserAgent = `Mozilla/5.0 ${"x".repeat(300)}`;

			// Act
			const { id } = await AuthEvent.create({
				userId: null,
				type: "login_failure",
				ip: "203.0.113.0",
				userAgent: longUserAgent,
			});

			// Assert
			expect((await selectAuthRows.event(id))?.userAgent).toBe(
				longUserAgent.slice(0, 255),
			);
		});
	});
});
