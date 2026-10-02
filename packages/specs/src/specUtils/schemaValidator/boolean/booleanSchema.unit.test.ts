import { describe, expect, test } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { booleanSchema } from "./booleanSchema.ts";

const schema = booleanSchema("Defeated");

describe("booleanSchema", () => {
	test.each([true, false])("accepte %s", (value) => {
		expect(schema.safeParse(value)).toStrictEqual({
			success: true,
			data: value,
		});
	});

	test.each([
		{ reason: 'la chaîne "true"', value: "true" },
		{ reason: 'la chaîne "false"', value: "false" },
		{ reason: "le nombre 1", value: 1 },
		{ reason: "le nombre 0", value: 0 },
		{ reason: "null", value: null },
		{ reason: "undefined", value: undefined },
		{ reason: "un objet", value: {} },
		{ reason: "un tableau", value: [true] },
	])("refuse $reason", ({ value }) => {
		expect(getIssues(schema.safeParse(value))).toStrictEqual([
			{ path: [], message: "Defeated should be a boolean" },
		]);
	});
});
