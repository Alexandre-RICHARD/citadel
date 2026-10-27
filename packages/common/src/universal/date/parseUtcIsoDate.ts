import type { IsoDate } from "./isoDate.type.ts";

// Minuit UTC du jour : compter des jours sur cette date ne dépend pas des changements d'heure
export function parseUtcIsoDate(isoDate: IsoDate): Date {
	const [year = 1970, month = 1, day = 1] = isoDate.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}
