import { addDaysToIsoDate } from "@citadel/common/src/universal/date/addDaysToIsoDate";
import { getMondayBasedWeekday } from "@citadel/common/src/universal/date/getMondayBasedWeekday";
import type { IsoDate } from "@citadel/common/src/universal/date/isoDate.type";

import type { CalendarDay } from "./calendarDay.type";

// Toujours six semaines : le calendrier garde la même hauteur d'un mois à l'autre
const WEEK_COUNT = 6;
const DAYS_PER_WEEK = 7;
const YEAR_MONTH_LENGTH = "YYYY-MM".length;

// Les semaines affichées pour le mois de `focusedDate`, du lundi au dimanche
export function getCalendarWeeks(focusedDate: IsoDate): CalendarDay[][] {
	const yearMonth = focusedDate.slice(0, YEAR_MONTH_LENGTH);
	const monthStart = `${yearMonth}-01` as IsoDate;
	const gridStart = addDaysToIsoDate(
		monthStart,
		-getMondayBasedWeekday(monthStart),
	);
	return Array.from({ length: WEEK_COUNT }, (_, week) =>
		Array.from({ length: DAYS_PER_WEEK }, (__, weekday) => {
			const date = addDaysToIsoDate(gridStart, week * DAYS_PER_WEEK + weekday);
			return {
				date,
				day: Number(date.slice(YEAR_MONTH_LENGTH + 1)),
				isInMonth: date.startsWith(yearMonth),
			};
		}),
	);
}
