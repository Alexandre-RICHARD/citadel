import type { IsoDate } from "@citadel/common/src/universal/date/isoDate.type";

// Une case du calendrier ; les jours des mois voisins complètent la première et la dernière semaine
export type CalendarDay = {
	date: IsoDate;
	day: number;
	isInMonth: boolean;
};
