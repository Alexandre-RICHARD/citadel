import { CalendarDays } from "lucide-react";
import { useId, useRef } from "react";

import type { IsoDate } from "../../types";
import { blurOnEnter, joinClassNames } from "../../utils";
import { Calendar } from "../Calendar";
import { Popover } from "../Popover";
import { Tooltip } from "../Tooltip";
import styles from "./dateField.module.scss";
import { useDateField } from "./useDateField";

type Props = {
	value: IsoDate | null;
	onCommit: (value: IsoDate | null) => void;
	/** « blur » : enregistrée en quittant le champ ; « change » : dès qu'une date complète est tapée ou choisie */
	commitOn?: "blur" | "change";
	/** Vider le champ efface la date */
	isNullable?: boolean;
	label: string;
	/** Champ de formulaire, ou cellule du tableau : se lit comme sa valeur, le cadre n'apparaît qu'au survol */
	variant?: "field" | "inline";
	className?: string | undefined;
};

/**
 * Date au format jj/mm/aaaa, tapée ou choisie dans un calendrier (bouton, ou Alt+↓ depuis le champ ; voir `useDateField`).
 * Le bouton du calendrier n'entre pas dans l'ordre de Tab : une cellule reste un seul arrêt au clavier.
 */
export function DateField({
	value,
	onCommit,
	commitOn = "blur",
	isNullable = true,
	label,
	variant = "field",
	className,
}: Props) {
	const fieldRef = useRef<HTMLSpanElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const calendarId = useId();
	const {
		text,
		shownDate,
		isCalendarOpen,
		openCalendar,
		closeCalendar,
		changeText,
		commitText,
		selectDate,
	} = useDateField({ value, onCommit, commitOn, isNullable });

	function isInCalendar(element: EventTarget | null): boolean {
		return (
			element instanceof Node &&
			document.getElementById(calendarId)?.contains(element) === true
		);
	}

	return (
		<span
			ref={fieldRef}
			className={joinClassNames(styles.field, styles[variant], className)}
		>
			<input
				ref={inputRef}
				type="text"
				inputMode="numeric"
				autoComplete="off"
				className={styles.input}
				value={text}
				placeholder="jj/mm/aaaa"
				aria-label={label}
				onChange={(event) => changeText(event.target.value)}
				onBlur={(event) => {
					// Le focus passe au calendrier : la saisie n'est pas finie
					if (!isInCalendar(event.relatedTarget)) {
						commitText();
					}
				}}
				onKeyDown={(event) => {
					if (event.altKey && event.key === "ArrowDown") {
						event.preventDefault();
						openCalendar();
					} else {
						blurOnEnter(event);
					}
				}}
			/>
			<Tooltip content="Calendrier (Alt+↓)">
				<button
					type="button"
					tabIndex={-1}
					className={styles.calendarButton}
					aria-label={`Calendrier : ${label}`}
					aria-expanded={isCalendarOpen}
					// Le champ garde le focus : la saisie en cours n'est pas enregistrée trop tôt
					onMouseDown={(event) => event.preventDefault()}
					onClick={() => (isCalendarOpen ? closeCalendar() : openCalendar())}
				>
					<CalendarDays aria-hidden />
				</button>
			</Tooltip>
			{isCalendarOpen && (
				<Popover
					anchorRef={fieldRef}
					id={calendarId}
					role="dialog"
					ariaLabel={`Calendrier : ${label}`}
					onClickOutside={() => {
						closeCalendar();
						commitText();
					}}
				>
					<Calendar
						value={shownDate}
						onSelect={(date) => {
							selectDate(date);
							inputRef.current?.focus();
						}}
						onClose={() => {
							closeCalendar();
							inputRef.current?.focus();
						}}
					/>
				</Popover>
			)}
		</span>
	);
}
