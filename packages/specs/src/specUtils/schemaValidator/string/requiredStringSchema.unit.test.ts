import { describe, expect, test } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { requiredStringSchema } from "./requiredStringSchema.ts";

const MAX_LENGTH = 10;
const schema = requiredStringSchema("Name", MAX_LENGTH);

describe("requiredStringSchema", () => {
	test.each([
		{ reason: "un seul caractère", value: "a", data: "a" },
		{
			reason: "exactement la longueur maximale",
			value: "Hades II !",
			data: "Hades II !",
		},
		{
			reason: "des espaces autour, retirés",
			value: "  Hades \t",
			data: "Hades",
		},
		{
			reason: "des retours à la ligne autour, retirés",
			value: "\nCeleste\r\n",
			data: "Celeste",
		},
		{
			reason: "une valeur trop longue tant que les espaces ne sont pas retirés",
			value: "   Hades II !   ",
			data: "Hades II !",
		},
		{
			reason: "des espaces intérieurs, conservés",
			value: "Ori   Wisp",
			data: "Ori   Wisp",
		},
		{
			reason: "des accents et idéogrammes",
			value: "Ōkami 大神",
			data: "Ōkami 大神",
		},
		{ reason: "un emoji complet", value: "Hades 🔥", data: "Hades 🔥" },
		// Zod compte les caractères comme la colonne utf8mb4 : un emoji vaut 1, pas les 2 unités de .length en JavaScript
		{
			reason: "autant d'emojis que la longueur maximale",
			value: "🔥".repeat(MAX_LENGTH),
			data: "🔥".repeat(MAX_LENGTH),
		},
		{
			reason: "le caractère NUL, que la base stocke tel quel",
			value: "a\u0000b",
			data: "a\u0000b",
		},
	])("accepte $reason", ({ value, data }) => {
		expect(schema.safeParse(value)).toStrictEqual({ success: true, data });
	});

	test.each([
		{ reason: "un nombre", value: 42 },
		{ reason: "null", value: null },
		{ reason: "undefined", value: undefined },
		{ reason: "un tableau", value: ["Cuphead"] },
		{ reason: "un booléen", value: true },
	])("refuse $reason : ce n'est pas une chaîne", ({ value }) => {
		expect(getIssues(schema.safeParse(value))).toStrictEqual([
			{ path: [], message: "Name should be a string" },
		]);
	});

	test.each([
		{ reason: "une chaîne vide", value: "" },
		{ reason: "uniquement des espaces", value: "   " },
		{
			reason: "uniquement des tabulations et retours à la ligne",
			value: "\t\n\r",
		},
	])(
		"refuse $reason : elle est vide une fois les espaces retirés",
		({ value }) => {
			expect(getIssues(schema.safeParse(value))).toStrictEqual([
				{ path: [], message: "Name should contain at least 1 character" },
			]);
		},
	);

	test.each([
		{ reason: "un caractère de trop", value: "Hades II !!" },
		{ reason: "un emoji de trop", value: "🔥".repeat(MAX_LENGTH + 1) },
	])("refuse $reason : la chaîne dépasse la longueur maximale", ({ value }) => {
		expect(getIssues(schema.safeParse(value))).toStrictEqual([
			{
				path: [],
				message: `Name should contain at most ${MAX_LENGTH} characters`,
			},
		]);
	});

	test.each([
		{ reason: "une première moitié d'emoji isolée", value: "Elden \uD83D" },
		{ reason: "une seconde moitié d'emoji isolée", value: "\uDC00 Ring" },
		{ reason: "deux moitiés dans le mauvais ordre", value: "a\uDC00\uD83Db" },
	])("refuse $reason, que la base remplacerait par �", ({ value }) => {
		expect(getIssues(schema.safeParse(value))).toStrictEqual([
			{ path: [], message: "Name should not contain invalid characters" },
		]);
	});
});
