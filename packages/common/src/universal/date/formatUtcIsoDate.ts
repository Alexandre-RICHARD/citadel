import type { IsoDate } from "./isoDate.type.ts";

const ISO_DATE_LENGTH = "YYYY-MM-DD".length;

// Le jour de la date en UTC : celui d'une date construite à minuit UTC, quel que soit le fuseau du navigateur ou du serveur
export function formatUtcIsoDate(date: Date): IsoDate {
	return date.toISOString().slice(0, ISO_DATE_LENGTH) as IsoDate;
}
