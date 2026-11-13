import { DurationMsEnum } from "@citadel/common/src/universal/date/durationMs.enum.ts";
import { getParisDay } from "@citadel/common/src/universal/date/getParisDay.ts";
import { pluralize } from "@citadel/common/src/universal/string/pluralize.ts";

const DAYS_PER_WEEK = 7;
const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;
const LAST_DAY_COUNTED_IN_DAYS = 7;
const LAST_DAY_COUNTED_IN_WEEKS = 35;

// Les jours de calendrier à Paris, pas les tranches de 24 h : une connexion d'hier soir date d'hier, à 8 h du matin
function countParisDays(from: Date, to: Date): number {
	const elapsedMs =
		Date.parse(getParisDay(to.getTime())) -
		Date.parse(getParisDay(from.getTime()));
	return Math.round(elapsedMs / DurationMsEnum.DAY);
}

/**
 * Une durée volontairement floue (« il y a 3 semaines »), pour dire à quelqu'un quand il s'est connecté sans que le
 * email devienne un relevé d'activité : « aujourd'hui », puis des jours jusqu'à 7, des semaines jusqu'à 5, des mois
 * jusqu'à 12, puis des années
 */
export function describeElapsedTime(from: Date, now: Date): string {
	const days = countParisDays(from, now);
	if (days <= 0) return "aujourd'hui";
	if (days <= LAST_DAY_COUNTED_IN_DAYS)
		return `il y a ${pluralize(days, "jour")}`;
	if (days <= LAST_DAY_COUNTED_IN_WEEKS)
		return `il y a ${pluralize(Math.floor(days / DAYS_PER_WEEK), "semaine")}`;
	if (days < DAYS_PER_YEAR) {
		return `il y a ${Math.floor(days / DAYS_PER_MONTH)} mois`;
	}
	return `il y a ${pluralize(Math.floor(days / DAYS_PER_YEAR), "an")}`;
}
