import { buildIsoDate } from "@citadel/common/src/universal/date/buildIsoDate";
import { isExistingDate } from "@citadel/common/src/universal/date/isExistingDate";
import type { IsoDate } from "@citadel/common/src/universal/date/isoDate.type";
import { regexDictionary } from "@citadel/common/src/universal/regex/regexDictionary";

// Une année tapée sur moins de 4 chiffres est une saisie en cours, pas l'an 201
const MIN_YEAR = 1000;

type DateParts = { year: number; month: number; day: number };

function readDateParts(text: string): DateParts | null {
	const dayFirst =
		regexDictionary.dayFirstDateInput.exec(text) ??
		regexDictionary.digitsOnlyDateInput.exec(text);
	if (dayFirst !== null)
		return {
			year: Number(dayFirst[3]),
			month: Number(dayFirst[2]),
			day: Number(dayFirst[1]),
		};
	const yearFirst = regexDictionary.yearFirstDateInput.exec(text);
	if (yearFirst !== null)
		return {
			year: Number(yearFirst[1]),
			month: Number(yearFirst[2]),
			day: Number(yearFirst[3]),
		};
	return null;
}

// Date tapée : « 17/09/2013 », « 1/9/2013 », « 17.09.2013 », « 17092013 » ou « 2013-09-17 » ; null si incomplète ou impossible (31/02)
export function parseTypedDate(text: string): IsoDate | null {
	const parts = readDateParts(text.trim());
	if (
		parts === null ||
		parts.year < MIN_YEAR ||
		!isExistingDate(parts.year, parts.month, parts.day)
	)
		return null;
	return buildIsoDate(parts.year, parts.month, parts.day);
}
