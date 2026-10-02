import { describe, expect, test } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { IdBoundEnum } from "./idBound.enum.ts";
import { pathParamIdSchema } from "./pathParamIdSchema.ts";

const schema = pathParamIdSchema("ID");

const FORMAT_MESSAGE =
	"ID has an invalid number format: only digits from 0 to 9 are accepted, without leading zero (e.g. 7 or 42)";

describe("pathParamIdSchema", () => {
	test.each([
		{ pathValue: "1", id: 1 },
		{ pathValue: "10", id: 10 },
		{ pathValue: "42", id: 42 },
		{ pathValue: String(IdBoundEnum.MAX), id: IdBoundEnum.MAX },
	])("convertit $pathValue en $id", ({ pathValue, id }) => {
		expect(schema.safeParse(pathValue)).toStrictEqual({
			success: true,
			data: id,
		});
	});

	test.each([
		{ reason: "du texte", pathValue: "abc" },
		{ reason: "une chaîne vide", pathValue: "" },
		{ reason: "un nombre suivi de texte", pathValue: "12abc" },
		{ reason: "Infinity", pathValue: "Infinity" },
		{ reason: "NaN", pathValue: "NaN" },
		{ reason: "un décimal", pathValue: "1.5" },
		{ reason: "un entier suivi d'un point", pathValue: "5." },
		{ reason: "un négatif", pathValue: "-7" },
		{ reason: "précédé d'un +", pathValue: "+5" },
		{ reason: "avec des zéros en tête", pathValue: "007" },
		{ reason: "un zéro suivi de zéros", pathValue: "00" },
		{ reason: "en notation scientifique", pathValue: "1e3" },
		{ reason: "en hexadécimal", pathValue: "0x10" },
		{ reason: "en binaire", pathValue: "0b11" },
		{ reason: "en octal", pathValue: "0o7" },
		{ reason: "avec un séparateur de milliers", pathValue: "1_000" },
		{ reason: "un espace", pathValue: " " },
		{ reason: "entouré d'espaces", pathValue: " 7 " },
		{ reason: "suivi d'un retour à la ligne", pathValue: "7\n" },
		{ reason: "en chiffres arabes orientaux", pathValue: "٧" },
	])("refuse le format quand c'est $reason", ({ pathValue }) => {
		expect(getIssues(schema.safeParse(pathValue))).toStrictEqual([
			{ path: [], message: FORMAT_MESSAGE },
		]);
	});

	test.each([
		{
			reason: "zéro, bien écrit mais sous le minimum",
			pathValue: "0",
			message: `ID should be at least ${IdBoundEnum.MIN}`,
		},
		{
			reason: "au-delà du maximum d'une colonne INT",
			pathValue: String(IdBoundEnum.MAX + 1),
			message: `ID should be at most ${IdBoundEnum.MAX}`,
		},
		{
			reason: "trop long pour être un nombre exact en JavaScript",
			pathValue: "99999999999999999999",
			message: `ID should be at most ${IdBoundEnum.MAX}`,
		},
	])("refuse $reason", ({ pathValue, message }) => {
		expect(getIssues(schema.safeParse(pathValue))).toStrictEqual([
			{ path: [], message },
		]);
	});

	test.each([
		{ reason: "un nombre déjà converti", value: 12 },
		{ reason: "undefined", value: undefined },
		{ reason: "null", value: null },
	])("refuse $reason : un path param est toujours une chaîne", ({ value }) => {
		expect(getIssues(schema.safeParse(value))).toStrictEqual([
			{ path: [], message: "ID should be a number" },
		]);
	});
});
