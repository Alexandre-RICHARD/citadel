import { DatabaseError } from "sequelize";
import { describe, expect, it } from "vitest";

import { isRecordChangedSinceReadError } from "./isRecordChangedSinceReadError.ts";

function databaseError(errno: number): DatabaseError {
	return new DatabaseError(
		Object.assign(new Error("MariaDB"), { errno, sql: "INSERT …" }),
	);
}

describe("isRecordChangedSinceReadError.ts", () => {
	describe("errors of the database", () => {
		it("SHOULD recognize the error WHEN MariaDB answers 1020", () => {
			// Act
			const result = isRecordChangedSinceReadError(databaseError(1020));

			// Assert
			expect(result).toBe(true);
		});

		it("SHOULD not recognize another error of the database", () => {
			// Act
			const result = isRecordChangedSinceReadError(databaseError(1213));

			// Assert
			expect(result).toBe(false);
		});
	});

	describe("other errors", () => {
		it("SHOULD not recognize an error that does not come from the database", () => {
			// Act
			const result = isRecordChangedSinceReadError(new Error("1020"));

			// Assert
			expect(result).toBe(false);
		});
	});
});
