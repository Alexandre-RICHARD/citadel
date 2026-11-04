import { describe, expect, it } from "vitest";

import { toSnakeCase } from "./toSnakeCase.ts";

describe("toSnakeCase.ts", () => {
	describe("column names", () => {
		it.each([
			{ name: "id", expected: "id" },
			{ name: "lastLoginAt", expected: "last_login_at" },
			{ name: "userAgent", expected: "user_agent" },
		])("SHOULD turn $name into $expected", ({ name, expected }) => {
			expect(toSnakeCase(name)).toBe(expected);
		});
	});
});
