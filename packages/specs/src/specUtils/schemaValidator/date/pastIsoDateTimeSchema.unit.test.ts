import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { getIssues } from "../../../testUtils/getIssues.ts";
import { pastIsoDateTimeSchema } from "./pastIsoDateTimeSchema.ts";
import { SqlDatetimeBoundEnum } from "./sqlDatetimeBound.enum.ts";

const schema = pastIsoDateTimeSchema("Date");

// Horloge figée : la limite « pas dans le futur » se teste à la milliseconde près
const NOW = "2025-06-15T12:00:00.000Z";

describe("pastIsoDateTimeSchema", () => {
	beforeEach(() => {
		vi.useFakeTimers({ now: new Date(NOW) });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test.each([
		{
			reason: "une date UTC avec millisecondes",
			date: "2024-05-30T21:45:00.123Z",
		},
		{
			reason: "une date UTC sans fraction de seconde",
			date: "2024-05-30T21:45:00Z",
		},
		{
			reason: "une date avec une seule décimale",
			date: "2024-05-30T21:45:00.1Z",
		},
		{
			reason:
				"une date à la microseconde, que la base tronquera à la milliseconde",
			date: "2024-05-30T21:45:00.123456Z",
		},
		{
			reason: "une date avec décalage horaire",
			date: "2024-05-30T23:45:00+02:00",
		},
		{
			reason: "une date avec décalage négatif",
			date: "2024-05-30T16:45:00-05:00",
		},
		{
			reason: "le décalage horaire maximal",
			date: "2024-01-01T10:00:00+14:00",
		},
		{
			reason: "un 29 février d'année bissextile",
			date: "2024-02-29T10:00:00Z",
		},
		{ reason: "maintenant, à la milliseconde près", date: NOW },
		{
			reason: "la plus petite date qu'un DATETIME accepte",
			date: SqlDatetimeBoundEnum.MIN,
		},
	])("accepte $reason, sans la modifier", ({ date }) => {
		expect(schema.safeParse(date)).toStrictEqual({ success: true, data: date });
	});

	test.each([
		{ reason: "du texte libre", value: "hier soir" },
		{ reason: "une date sans heure", value: "2024-01-01" },
		{ reason: "une date sans fuseau horaire", value: "2024-01-01T10:00:00" },
		{ reason: "une heure sans secondes", value: "2024-01-01T10:00Z" },
		{
			reason: "un décalage sans deux-points",
			value: "2024-01-01T10:00:00+0200",
		},
		{ reason: "un 30 février", value: "2024-02-30T10:00:00Z" },
		{
			reason: "un 29 février d'année non bissextile",
			value: "2023-02-29T10:00:00Z",
		},
		{ reason: "un treizième mois", value: "2024-13-01T10:00:00Z" },
		{ reason: "24 heures", value: "2024-01-01T24:00:00Z" },
		{ reason: "une année sur six chiffres", value: "+002024-01-01T10:00:00Z" },
		{ reason: "une chaîne vide", value: "" },
		{ reason: "un timestamp numérique", value: 1_700_000_000_000 },
		{ reason: "un objet Date", value: new Date("2024-01-01T10:00:00Z") },
		{ reason: "null", value: null },
		{ reason: "undefined", value: undefined },
	])("refuse $reason : ce n'est pas une date ISO 8601", ({ value }) => {
		expect(getIssues(schema.safeParse(value))).toStrictEqual([
			{ path: [], message: "Date should be an ISO 8601 datetime" },
		]);
	});

	test.each([
		{
			reason: "une milliseconde après maintenant",
			value: "2025-06-15T12:00:00.001Z",
		},
		{
			reason: "maintenant, exprimé dans un fuseau en avance",
			value: "2025-06-15T14:00:00.001+02:00",
		},
		{ reason: "une date lointaine", value: "2999-01-01T00:00:00.000Z" },
	])("refuse $reason : la date est dans le futur", ({ value }) => {
		expect(getIssues(schema.safeParse(value))).toStrictEqual([
			{ path: [], message: "Date should not be in the future" },
		]);
	});

	test.each([
		{
			reason: "une milliseconde avant l'an 1000",
			value: "0999-12-31T23:59:59.999Z",
		},
		{
			reason: "l'an 1, que la base enregistrerait en 2001",
			value: "0001-01-01T00:00:00.000Z",
		},
		{
			reason:
				"le 1er janvier 1000 en heure locale, encore en 999 une fois en UTC",
			value: "1000-01-01T00:30:00.000+01:00",
		},
	])("refuse $reason : hors de portée d'un DATETIME", ({ value }) => {
		expect(getIssues(schema.safeParse(value))).toStrictEqual([
			{
				path: [],
				message: `Date should not be before ${SqlDatetimeBoundEnum.MIN}`,
			},
		]);
	});
});
