import { type KeyboardEvent, useState } from "react";

import { getTodayIsoDate } from "../../helper/date/getTodayIsoDate";
import type { IsoDate } from "../../helper/date/isoDate.type";

type CalendarDay = {
	date: IsoDate;
	day: number;
	isInMonth: boolean;
};

/** Date ISO → date UTC à minuit : les calculs de jours ne dépendent pas des changements d'heure */
function toUtcDate(date: IsoDate): Date {
	const [year = 1970, month = 1, day = 1] = date.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(date: Date): IsoDate {
	return date.toISOString().slice(0, 10) as IsoDate;
}

function addDays(date: IsoDate, days: number): IsoDate {
	const utcDate = toUtcDate(date);
	utcDate.setUTCDate(utcDate.getUTCDate() + days);
	return toIsoDate(utcDate);
}

/** Même jour, `months` mois plus loin, ramené au dernier jour du mois s'il n'existe pas (31 janvier → 28 février) */
function addMonths(date: IsoDate, months: number): IsoDate {
	const utcDate = toUtcDate(date);
	const day = utcDate.getUTCDate();
	utcDate.setUTCDate(1);
	utcDate.setUTCMonth(utcDate.getUTCMonth() + months);
	const lastDay = new Date(
		Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth() + 1, 0),
	).getUTCDate();
	utcDate.setUTCDate(Math.min(day, lastDay));
	return toIsoDate(utcDate);
}

/** Lundi = 0 … dimanche = 6 */
function getWeekdayIndex(date: IsoDate): number {
	return (toUtcDate(date).getUTCDay() + 6) % 7;
}

const monthFormat = new Intl.DateTimeFormat("fr-FR", {
	month: "long",
	year: "numeric",
	timeZone: "UTC",
});

/** Les six semaines affichées pour le mois de `focusedDate`, du lundi au dimanche */
function getWeeks(focusedDate: IsoDate): CalendarDay[][] {
	const monthStart = `${focusedDate.slice(0, 7)}-01` as IsoDate;
	const gridStart = addDays(monthStart, -getWeekdayIndex(monthStart));
	return Array.from({ length: 6 }, (_, week) =>
		Array.from({ length: 7 }, (__, weekday) => {
			const date = addDays(gridStart, week * 7 + weekday);
			return {
				date,
				day: Number(date.slice(8)),
				isInMonth: date.slice(0, 7) === focusedDate.slice(0, 7),
			};
		}),
	);
}

/**
 * Calendrier d'un mois au clavier : flèches (jour, semaine), Début et Fin (semaine), Page préc. et suiv. (mois),
 * avec Maj (année) ; Entrée ou Espace choisit le jour, Échap et Tab ferment.
 */
export function useCalendar({
	value,
	onSelect,
	onClose,
}: {
	value: IsoDate | null;
	onSelect: (date: IsoDate) => void;
	onClose: () => void;
}) {
	const [focusedDate, setFocusedDate] = useState<IsoDate>(
		() => value ?? getTodayIsoDate(),
	);

	function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
		const moves: Partial<Record<string, () => IsoDate>> = {
			ArrowLeft: () => addDays(focusedDate, -1),
			ArrowRight: () => addDays(focusedDate, 1),
			ArrowUp: () => addDays(focusedDate, -7),
			ArrowDown: () => addDays(focusedDate, 7),
			Home: () => addDays(focusedDate, -getWeekdayIndex(focusedDate)),
			End: () => addDays(focusedDate, 6 - getWeekdayIndex(focusedDate)),
			PageUp: () => addMonths(focusedDate, event.shiftKey ? -12 : -1),
			PageDown: () => addMonths(focusedDate, event.shiftKey ? 12 : 1),
		};
		const move = moves[event.key];
		if (move !== undefined) {
			event.preventDefault();
			setFocusedDate(move());
		} else if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onSelect(focusedDate);
		} else if (event.key === "Escape" || event.key === "Tab") {
			// Échap et Tab referment le calendrier seulement : le focus revient au champ
			event.preventDefault();
			event.stopPropagation();
			onClose();
		}
	}

	return {
		focusedDate,
		monthLabel: monthFormat.format(toUtcDate(focusedDate)),
		weeks: getWeeks(focusedDate),
		today: getTodayIsoDate(),
		showPreviousMonth: () => setFocusedDate(addMonths(focusedDate, -1)),
		showNextMonth: () => setFocusedDate(addMonths(focusedDate, 1)),
		showPreviousYear: () => setFocusedDate(addMonths(focusedDate, -12)),
		showNextYear: () => setFocusedDate(addMonths(focusedDate, 12)),
		setFocusedDate,
		handleKeyDown,
	};
}
