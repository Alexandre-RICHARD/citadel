import { describe, expect, test } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { nullableStringSchema } from "./nullableStringSchema.ts";

const MAX_LENGTH = 12;
const boundedSchema = nullableStringSchema("Comment", MAX_LENGTH);
const unboundedSchema = nullableStringSchema("Stack");

describe("nullableStringSchema", () => {
	test.each([
		{
			reason: "un texte, sans les espaces autour",
			value: "  Trop dur  ",
			data: "Trop dur",
		},
		{
			reason: "exactement la longueur maximale",
			value: "Encore raté!",
			data: "Encore raté!",
		},
		{ reason: "null, conservé", value: null, data: null },
		{ reason: "une chaîne vide, changée en null", value: "", data: null },
		{
			reason: "uniquement des espaces, changés en null",
			value: " \t\n ",
			data: null,
		},
		{ reason: "un emoji complet", value: "Raté 🦊", data: "Raté 🦊" },
	])("accepte $reason", ({ value, data }) => {
		expect(boundedSchema.safeParse(value)).toStrictEqual({
			success: true,
			data,
		});
	});

	test("accepte un texte très long sans longueur maximale (colonne LONGTEXT)", () => {
		const longStack = "at foo (bar.ts:1:1)\n".repeat(10_000).trim();

		expect(unboundedSchema.safeParse(longStack)).toStrictEqual({
			success: true,
			data: longStack,
		});
	});

	test.each([
		{ reason: "un nombre", value: 5 },
		{ reason: "undefined : null doit être explicite", value: undefined },
		{ reason: "un booléen", value: false },
		{ reason: "un tableau", value: ["Raté"] },
	])("refuse $reason : ce n'est pas une chaîne", ({ value }) => {
		expect(getIssues(boundedSchema.safeParse(value))).toStrictEqual([
			{ path: [], message: "Comment should be a string" },
		]);
	});

	test("refuse un texte qui dépasse la longueur maximale, même entouré d'espaces retirés ensuite", () => {
		expect(
			getIssues(boundedSchema.safeParse("  Encore raté !  ")),
		).toStrictEqual([
			{
				path: [],
				message: `Comment should contain at most ${MAX_LENGTH} characters`,
			},
		]);
	});

	test.each([
		{ reason: "une première moitié d'emoji isolée", value: "Raté \uD83D" },
		{ reason: "une seconde moitié d'emoji isolée", value: "\uDC00 raté" },
	])("refuse $reason, que la base remplacerait par �", ({ value }) => {
		expect(getIssues(boundedSchema.safeParse(value))).toStrictEqual([
			{ path: [], message: "Comment should not contain invalid characters" },
		]);
	});
});
