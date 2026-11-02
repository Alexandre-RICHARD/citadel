import { describe, expect, it } from "vitest";

import { describeError } from "./describeError.ts";

const SECRET = "le-corps-de-la-requete";

function errorWithProperties(properties: Record<string, unknown>): Error {
	return Object.assign(new Error("Request failed"), properties);
}

describe("describeError.ts", () => {
	describe("kept details", () => {
		it("SHOULD keep the stack WHEN given an error", () => {
			// Arrange
			const error = new TypeError("Cannot read properties of undefined");

			// Act
			const description = describeError(error);

			// Assert
			expect(description).toBe(error.stack);
		});

		it("SHOULD write the current name and message WHEN the stack was captured before them", () => {
			// Arrange
			const error = new Error("");
			error.stack = "Error: \n    at Query.run (query.js:53:25)";
			error.name = "SequelizeDatabaseError";
			error.message = "Data too long for column 'error_type'";

			// Act
			const description = describeError(error);

			// Assert
			expect(description).toBe(
				"SequelizeDatabaseError: Data too long for column 'error_type'\n    at Query.run (query.js:53:25)",
			);
		});

		it("SHOULD add each cause after the error WHEN the error has causes", () => {
			// Arrange
			const driverError = new Error("Table 'citadel.gdc_game' doesn't exist");
			const error = new Error("Failed to fetch games", { cause: driverError });

			// Act
			const description = describeError(error);

			// Assert
			expect(description).toBe(
				`${error.stack}\nCaused by: ${driverError.stack}`,
			);
		});

		it("SHOULD follow the driver error WHEN Sequelize keeps it in original", () => {
			// Arrange
			const driverError = new Error("Duplicate entry for key 'email'");
			const sequelizeError = Object.assign(new Error("Validation error"), {
				original: driverError,
			});

			// Act
			const description = describeError(sequelizeError);

			// Assert
			expect(description).toContain(
				"Caused by: Error: Duplicate entry for key 'email'",
			);
		});

		it("SHOULD list the message of each field without its value WHEN Sequelize reports field errors", () => {
			// Arrange
			const error = Object.assign(new Error("Validation error"), {
				name: "SequelizeUniqueConstraintError",
				errors: [{ message: "email must be unique", value: SECRET }],
			});

			// Act
			const description = describeError(error);

			// Assert
			expect(description).toContain(
				"SequelizeUniqueConstraintError: Validation error\n  - email must be unique",
			);
			expect(description).not.toContain(SECRET);
		});

		it("SHOULD stop after five causes WHEN the causes loop", () => {
			// Arrange
			const error = new Error("Loop");
			error.cause = error;

			// Act
			const description = describeError(error);

			// Assert
			expect(description.split("Caused by: ")).toHaveLength(6);
		});

		it("SHOULD write a thrown primitive WHEN the value is not an error", () => {
			// Act
			const description = describeError(42);

			// Assert
			expect(description).toBe("Non-Error value thrown: 42");
		});
	});

	describe("dropped details", () => {
		it.each([
			{ property: "body", reason: "the raw body read by body-parser" },
			{ property: "parameters", reason: "the parameters of a Sequelize query" },
			{ property: "sql", reason: "the SQL text of a Sequelize query" },
		])(
			"SHOULD never write $property WHEN the error carries $reason",
			({ property }) => {
				// Arrange
				const error = errorWithProperties({ [property]: SECRET });

				// Act
				const description = describeError(error);

				// Assert
				expect(description).not.toContain(SECRET);
			},
		);

		it("SHOULD never write the properties of a cause WHEN the cause carries a body", () => {
			// Arrange
			const error = new Error("Failed", {
				cause: errorWithProperties({ body: SECRET }),
			});

			// Act
			const description = describeError(error);

			// Assert
			expect(description).not.toContain(SECRET);
		});

		it("SHOULD never write the content of an object WHEN an object is thrown", () => {
			// Act
			const description = describeError({ password: SECRET });

			// Assert
			expect(description).toBe("Non-Error value thrown (object)");
		});
	});
});
