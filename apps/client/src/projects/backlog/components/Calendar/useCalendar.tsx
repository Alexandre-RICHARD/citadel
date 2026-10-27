import { addDaysToIsoDate } from "@citadel/common/src/universal/date/addDaysToIsoDate";
import { addMonthsToIsoDate } from "@citadel/common/src/universal/date/addMonthsToIsoDate";
import { getMondayBasedWeekday } from "@citadel/common/src/universal/date/getMondayBasedWeekday";
import { getTodayIsoDate } from "@citadel/common/src/universal/date/getTodayIsoDate";
import type { IsoDate } from "@citadel/common/src/universal/date/isoDate.type";
import { parseUtcIsoDate } from "@citadel/common/src/universal/date/parseUtcIsoDate";
import { type KeyboardEvent, useState } from "react";

import { getCalendarWeeks } from "../../helper/date/getCalendarWeeks";

const monthFormat = new Intl.DateTimeFormat("fr-FR", {
	month: "long",
	year: "numeric",
	timeZone: "UTC",
});

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
			ArrowLeft: () => addDaysToIsoDate(focusedDate, -1),
			ArrowRight: () => addDaysToIsoDate(focusedDate, 1),
			ArrowUp: () => addDaysToIsoDate(focusedDate, -7),
			ArrowDown: () => addDaysToIsoDate(focusedDate, 7),
			Home: () =>
				addDaysToIsoDate(focusedDate, -getMondayBasedWeekday(focusedDate)),
			End: () =>
				addDaysToIsoDate(focusedDate, 6 - getMondayBasedWeekday(focusedDate)),
			PageUp: () => addMonthsToIsoDate(focusedDate, event.shiftKey ? -12 : -1),
			PageDown: () => addMonthsToIsoDate(focusedDate, event.shiftKey ? 12 : 1),
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
		monthLabel: monthFormat.format(parseUtcIsoDate(focusedDate)),
		weeks: getCalendarWeeks(focusedDate),
		today: getTodayIsoDate(),
		showPreviousMonth: () =>
			setFocusedDate(addMonthsToIsoDate(focusedDate, -1)),
		showNextMonth: () => setFocusedDate(addMonthsToIsoDate(focusedDate, 1)),
		showPreviousYear: () =>
			setFocusedDate(addMonthsToIsoDate(focusedDate, -12)),
		showNextYear: () => setFocusedDate(addMonthsToIsoDate(focusedDate, 12)),
		setFocusedDate,
		handleKeyDown,
	};
}
