import { useState } from "react";

import type { IsoDate } from "../../types";
import { formatIsoDate } from "../../utils";

function pad(value: number): string {
	return String(value).padStart(2, "0");
}

/** Date tapée : « 17/09/2013 », « 1/9/2013 », « 17.09.2013 », « 17092013 » ou « 2013-09-17 » ; `null` si incomplète ou impossible (31/02) */
function parseTypedDate(text: string): IsoDate | null {
	const trimmed = text.trim();
	const dayFirst = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(trimmed);
	const yearFirst = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
	const digitsOnly = /^(\d{2})(\d{2})(\d{4})$/.exec(trimmed);
	let parts: [number, number, number] | null = null;
	if (dayFirst !== null) {
		parts = [Number(dayFirst[3]), Number(dayFirst[2]), Number(dayFirst[1])];
	} else if (yearFirst !== null) {
		parts = [Number(yearFirst[1]), Number(yearFirst[2]), Number(yearFirst[3])];
	} else if (digitsOnly !== null) {
		parts = [
			Number(digitsOnly[3]),
			Number(digitsOnly[2]),
			Number(digitsOnly[1]),
		];
	}
	if (parts === null) {
		return null;
	}
	const [year, month, day] = parts;
	const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
	if (year < 1000 || month < 1 || month > 12 || day < 1 || day > lastDay) {
		return null;
	}
	return `${year}-${pad(month)}-${pad(day)}` as IsoDate;
}

/**
 * En tapant des chiffres, les barres s'ajoutent toutes seules : « 17092013 » s'écrit « 17/09/2013 ».
 * Une saisie qui pose ses propres barres ailleurs (« 1/9/2013 ») reste telle quelle.
 */
function insertSlashes(text: string): string {
	const isOwnFormat =
		/^[\d/]*$/.test(text) &&
		!text.endsWith("/") &&
		[...text].every(
			(character, index) => character !== "/" || index === 2 || index === 5,
		);
	if (!isOwnFormat) {
		return text;
	}
	const digits = text.replace(/\//g, "").slice(0, 8);
	return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
		.filter((part) => part !== "")
		.join("/");
}

/**
 * Saisie d'une date au format jj/mm/aaaa, ou au calendrier.
 * `commitOn` « blur » : la date est enregistrée en quittant le champ (cellules du tableau, brouillons) ;
 * « change » : dès qu'elle est complète (filtres, fenêtre de date de fin). Vide, le champ vaut `null` s'il l'accepte ;
 * une date incomplète ou impossible remet le champ à la dernière date acceptée.
 */
export function useDateField({
	value,
	onCommit,
	commitOn,
	isNullable,
}: {
	value: IsoDate | null;
	onCommit: (value: IsoDate | null) => void;
	commitOn: "blur" | "change";
	isNullable: boolean;
}) {
	const formattedValue = value === null ? "" : formatIsoDate(value);
	const [text, setText] = useState(formattedValue);
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	// Une nouvelle valeur venue d'ailleurs (annulation, autre champ) remplace la saisie
	const [shownValue, setShownValue] = useState(value);
	if (value !== shownValue) {
		setShownValue(value);
		setText(formattedValue);
	}

	function commit(date: IsoDate | null) {
		if (date !== value) {
			onCommit(date);
		}
	}

	function changeText(nextText: string) {
		// En effaçant, la saisie reste telle quelle ; en tapant, les barres s'ajoutent
		const shownText =
			nextText.length > text.length ? insertSlashes(nextText) : nextText;
		setText(shownText);
		if (commitOn === "change") {
			if (shownText.trim() === "") {
				if (isNullable) {
					commit(null);
				}
			} else {
				const date = parseTypedDate(shownText);
				if (date !== null) {
					commit(date);
				}
			}
		}
	}

	/** En quittant le champ : la date tapée est prise (« blur »), ou le champ revient à la dernière date acceptée */
	function commitText() {
		if (text.trim() === "") {
			if (isNullable) {
				commit(null);
			} else {
				setText(formattedValue);
			}
			return;
		}
		const date = parseTypedDate(text);
		if (date === null) {
			setText(formattedValue);
			return;
		}
		setText(formatIsoDate(date));
		if (commitOn === "blur") {
			commit(date);
		}
	}

	function selectDate(date: IsoDate) {
		setText(formatIsoDate(date));
		setIsCalendarOpen(false);
		commit(date);
	}

	return {
		text,
		/** La date tapée si elle est complète, sinon celle enregistrée : le calendrier s'ouvre dessus */
		shownDate: parseTypedDate(text) ?? value,
		isCalendarOpen,
		openCalendar: () => setIsCalendarOpen(true),
		closeCalendar: () => setIsCalendarOpen(false),
		changeText,
		commitText,
		selectDate,
	};
}
