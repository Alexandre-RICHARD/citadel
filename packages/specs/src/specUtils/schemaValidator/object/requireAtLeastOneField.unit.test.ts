import { describe, expect, test } from "vitest";
import { z } from "zod";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { requireAtLeastOneField } from "./requireAtLeastOneField.ts";

const schema = requireAtLeastOneField(
	z.object({
		comment: z.string().optional(),
		count: z.number().optional(),
	}),
);

const MESSAGE = "At least one of comment, count should be provided";

describe("requireAtLeastOneField", () => {
	test.each([
		{ reason: "le premier champ seul", value: { comment: "Raté" } },
		{ reason: "le second champ seul", value: { count: 3 } },
		{ reason: "les deux champs", value: { comment: "Raté", count: 3 } },
		{
			reason: "un champ à une valeur fausse mais présente (0)",
			value: { count: 0 },
		},
		{ reason: "un champ à une chaîne vide", value: { comment: "" } },
	])("accepte $reason", ({ value }) => {
		expect(schema.safeParse(value)).toStrictEqual({
			success: true,
			data: value,
		});
	});

	test("retire les champs inconnus", () => {
		expect(schema.safeParse({ comment: "Raté", bossId: 3 })).toStrictEqual({
			success: true,
			data: { comment: "Raté" },
		});
	});

	test.each([
		{ reason: "un objet vide", value: {} },
		{
			reason: "des champs connus explicitement undefined",
			value: { comment: undefined },
		},
		{
			reason: "uniquement des champs inconnus, retirés avant la vérification",
			value: { bossId: 3 },
		},
	])("refuse $reason, avec la liste des champs possibles", ({ value }) => {
		expect(getIssues(schema.safeParse(value))).toStrictEqual([
			{ path: [], message: MESSAGE },
		]);
	});

	test("ne vérifie la présence d'un champ qu'une fois les champs valides", () => {
		expect(getIssues(schema.safeParse({ count: "3" }))).toStrictEqual([
			{
				path: ["count"],
				message: "Invalid input: expected number, received string",
			},
		]);
	});
});
