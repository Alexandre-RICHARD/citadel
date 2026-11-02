import { describe, expect, it } from "vitest";

import { insertAuthRows } from "../../testUtils/integration/auth/insertAuthRows.ts";
import { selectAuthRows } from "../../testUtils/integration/auth/selectAuthRows.ts";

// La migration V020
describe("allowDecoyAuthFlows", () => {
	describe("flows without account", () => {
		it.each([
			{ kind: "mail_login", step: "mail_code" },
			{ kind: "password_reset", step: "mail_code" },
		])(
			"SHOULD accept a $kind flow WHEN the typed identifier matches no account",
			async ({ kind, step }) => {
				// Act
				const id = await insertAuthRows.flow({ kind, step, userId: null });

				// Assert
				expect(await selectAuthRows.flow(id)).toMatchObject({
					kind,
					userId: null,
				});
			},
		);

		it.each([
			{ kind: "mail_login", step: "mail_code" },
			{ kind: "password_reset", step: "mail_code" },
		])(
			"SHOULD still accept a $kind flow WHEN it has an account",
			async ({ kind, step }) => {
				// Arrange
				const userId = await insertAuthRows.user();

				// Act
				const id = await insertAuthRows.flow({ kind, step, userId });

				// Assert
				expect((await selectAuthRows.flow(id))?.userId).toBe(userId);
			},
		);
	});
});
