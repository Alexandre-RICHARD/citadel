import { formatShortIsoDate } from "@citadel/common/src/universal/date/formatShortIsoDate";
import type { IsoDate } from "@citadel/common/src/universal/date/isoDate.type";
import { useState } from "react";

import { insertDateSlashes } from "../../helper/date/insertDateSlashes";
import { parseTypedDate } from "../../helper/date/parseTypedDate";

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
	value: string | null;
	onCommit: (value: IsoDate | null) => void;
	commitOn: "blur" | "change";
	isNullable: boolean;
}) {
	const formattedValue = value === null ? "" : formatShortIsoDate(value);
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
			nextText.length > text.length ? insertDateSlashes(nextText) : nextText;
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
		setText(formatShortIsoDate(date));
		if (commitOn === "blur") {
			commit(date);
		}
	}

	function selectDate(date: IsoDate) {
		setText(formatShortIsoDate(date));
		setIsCalendarOpen(false);
		commit(date);
	}

	return {
		text,
		/** La date tapée si elle est complète, sinon celle enregistrée : le calendrier s'ouvre dessus */
		// La valeur reçue est une date ISO : relue, elle devient une IsoDate pour le calendrier
		shownDate:
			parseTypedDate(text) ?? (value === null ? null : parseTypedDate(value)),
		isCalendarOpen,
		openCalendar: () => setIsCalendarOpen(true),
		closeCalendar: () => setIsCalendarOpen(false),
		changeText,
		commitText,
		selectDate,
	};
}
