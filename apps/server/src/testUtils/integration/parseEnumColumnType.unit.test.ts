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
	});

	describe("other columns", () => {
		it("SHOULD return no value WHEN the type is not an enum", () => {
			// Act
			const values = parseEnumColumnType("varchar(50)");

			// Assert
			expect(values).toStrictEqual([]);
		});
	});
});
