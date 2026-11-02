import { QueryTypes } from "sequelize";
import { describe, expect, it, vi } from "vitest";

import { sequelize } from "../configuration/sequelize.ts";
import { createErrorLogQuery } from "../projects/errorLog/query/createErrorLogQuery.ts";
import { logError } from "./logError.ts";

const CONTEXT = "Test de logError";
const SECRET = "valeur-du-corps-de-la-requete";
// Plus long que la colonne error_type (VARCHAR(100)) : la base refuse la ligne
const TOO_LONG_ERROR_TYPE = "e".repeat(101);

type ErrorLogRow = {
	message: string;
	stack: string | null;
};

async function selectLastErrorLog(): Promise<ErrorLogRow | null> {
	return sequelize.query<ErrorLogRow>(
		"SELECT message, stack FROM error_log ORDER BY id DESC LIMIT 1",
		{ type: QueryTypes.SELECT, plain: true },
	);
}

// Une vraie erreur du driver, levée par une requête dont un paramètre porte SECRET
async function catchDriverError(): Promise<unknown> {
	return createErrorLogQuery({
		errorType: TOO_LONG_ERROR_TYPE,
		message: SECRET,
		stack: null,
	}).then(
		() => {
			throw new Error("The insert should have failed");
		},
		(error: unknown) => error,
	);
}

describe("logError", () => {
	describe("error_log row", () => {
		it("SHOULD write the error and its cause without any query parameter WHEN the database refused a query", async () => {
			// Arrange
			const consoleError = vi
				.spyOn(console, "error")
				.mockImplementation(() => undefined);
			const error = await catchDriverError();

			// Act
			await logError(error, CONTEXT);

			// Assert
			const row = await selectLastErrorLog();
			expect(row?.message).toBe(`[${CONTEXT}] Failed to insert new error log`);
			expect(row?.stack).toContain("Caused by: SequelizeDatabaseError");
			expect(row?.stack).not.toContain(SECRET);
			expect(JSON.stringify(consoleError.mock.calls)).not.toContain(SECRET);
		});
	});
});
