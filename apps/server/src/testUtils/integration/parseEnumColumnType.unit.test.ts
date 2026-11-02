import { describe, expect, it } from "vitest";

import { parseEnumColumnType } from "./parseEnumColumnType.ts";

describe("parseEnumColumnType.ts", () => {
	describe("enum columns", () => {
		it("SHOULD return the values in the order of the column WHEN the type is an enum", () => {
			// Act
			const values = parseEnumColumnType("enum('mail','password','both')");

			// Assert
			expect(values).toStrictEqual(["mail", "password", "both"]);
		});

		it("SHOULD keep underscores WHEN a value has some", () => {
			// Act
			const values = parseEnumColumnType("enum('mail_code','second_factor')");

			// Assert
			expect(values).toStrictEqual(["mail_code", "second_factor"]);
		});

		it("SHOULD read a doubled apostrophe as one apostrophe WHEN a value has some", () => {
			// Act
			const values = parseEnumColumnType("enum('l''app','mail')");

			// Assert
			expect(values).toStrictEqual(["l'app", "mail"]);
		});
	});

	describe("other columns", () => {
		it.each([
			{ reason: "a set", columnType: "set('email','totp')" },
			{ reason: "a varchar", columnType: "varchar(50)" },
		])("SHOULD throw WHEN the type is $reason", ({ columnType }) => {
			// Act & Assert
			expect(() => parseEnumColumnType(columnType)).toThrow(
				`Colonne ENUM attendue, reçu « ${columnType} »`,
			);
		});
	});
});
