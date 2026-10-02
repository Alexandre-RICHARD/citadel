import { describe, expect, test } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { bodyIdSchema } from "./bodyIdSchema.ts";
import { IdBoundEnum } from "./idBound.enum.ts";

const schema = bodyIdSchema("Game ID");

describe("bodyIdSchema", () => {
	test.each([
		{ reason: "le plus petit id", value: IdBoundEnum.MIN },
		{ reason: "un id courant", value: 42 },
		{ reason: "le plus grand id d'une colonne INT", value: IdBoundEnum.MAX },
		{ reason: "un nombre écrit 2.0 en JSON, identique à 2", value: 2.0 },
	])("accepte $reason", ({ value }) => {
		expect(schema.safeParse(value)).toStrictEqual({
			success: true,
			data: value,
		});
	});

	test.each([
		{ reason: "un nombre écrit en chaîne", value: "3" },
		{ reason: "null", value: null },
		{ reason: "undefined", value: undefined },
		{ reason: "NaN", value: Number.NaN },
		{ reason: "Infinity", value: Number.POSITIVE_INFINITY },
		{ reason: "un booléen", value: true },
	])("refuse $reason : ce n'est pas un nombre", ({ value }) => {
		expect(getIssues(schema.safeParse(value))).toStrictEqual([
			{
				path: [],
				message: 'Game ID should be a JSON number, not text (e.g. 7, not "7")',
			},
		]);
	});

	test.each([
		{ value: 1.5, message: "Game ID should be an integer (e.g. 7, not 7.5)" },
		{ value: 0, message: "Game ID should be at least 1" },
		{ value: -2, message: "Game ID should be at least 1" },
		{
			value: IdBoundEnum.MAX + 1,
			message: `Game ID should be at most ${IdBoundEnum.MAX}`,
		},
	])("refuse $value : $message", ({ value, message }) => {
		expect(getIssues(schema.safeParse(value))).toStrictEqual([
			{ path: [], message },
		]);
	});
});
