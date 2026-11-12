import { blurOnEnter } from "@citadel/common/src/browser/dom/blurOnEnter";
import { useWheelStep } from "@citadel/common/src/react/hooks/useWheelStep";
import type { DurationUnit } from "@citadel/common/src/universal/date/durationUnit.type";
import { shiftDuration } from "@citadel/common/src/universal/date/shiftDuration";
import { splitMinutesIntoHours } from "@citadel/common/src/universal/date/splitMinutesIntoHours";
import { padWithZeros } from "@citadel/common/src/universal/number/padWithZeros";
import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import {
	type FormEvent,
	type KeyboardEvent,
	type RefObject,
	useRef,
} from "react";

import styles from "./durationField.module.scss";

// Largeur des champs, en chiffres : de la place pour un grand nombre d'heures (un jeu de plusieurs centaines d'heures
// ne doit pas rogner la valeur), et un chiffre de marge pour la saisie
const MIN_HOURS_WIDTH_CH = 4;
const MINUTES_WIDTH_CH = 2;

function getHoursWidth(hours: number): number {
	return Math.max(MIN_HOURS_WIDTH_CH, String(hours).length + 1);
}

type Props = {
	minutes: number;
	label: string;
	onCommit: (minutes: number) => void;
	/** Champ de formulaire, ou cellule du tableau : se lit comme sa valeur, le cadre n'apparaît qu'au survol */
	variant?: "field" | "inline";
	className?: string | undefined;
};

/**
 * Durée saisie en heures et minutes, dans un seul cadre ; enregistrée en minutes quand le focus quitte les deux champs.
 * La molette, sur le champ qui a le focus, change la durée en direct (vers le haut : plus) : 59 minutes + 1 passe à 0 et
 * ajoute une heure, et inversement ; jamais de durée négative
 */
export function DurationField({
	minutes,
	label,
	onCommit,
	variant = "field",
	className,
}: Props) {
	const hoursRef = useRef<HTMLInputElement>(null);
	const minutesRef = useRef<HTMLInputElement>(null);
	const { hours, minutes: extraMinutes } = splitMinutesIntoHours(minutes);
	const extraMinutesText = padWithZeros(extraMinutes);

	// Le total saisi dans les deux champs ; null si l'un des deux n'est pas un entier positif
	function readTypedMinutes(): number | null {
		const hoursInput = hoursRef.current;
		const minutesInput = minutesRef.current;
		if (hoursInput === null || minutesInput === null) {
			return null;
		}
		const typedHours = Number(hoursInput.value || "0");
		const typedMinutes = Number(minutesInput.value || "0");
		if (
			!Number.isInteger(typedHours) ||
			!Number.isInteger(typedMinutes) ||
			typedHours < 0 ||
			typedMinutes < 0
		) {
			return null;
		}
		return typedHours * 60 + typedMinutes;
	}

	function showTypedMinutes(totalMinutes: number) {
		const hoursInput = hoursRef.current;
		const minutesInput = minutesRef.current;
		if (hoursInput === null || minutesInput === null) {
			return;
		}
		const shown = splitMinutesIntoHours(totalMinutes);
		hoursInput.value = String(shown.hours);
		hoursInput.style.width = `${getHoursWidth(shown.hours)}ch`;
		minutesInput.value = padWithZeros(shown.minutes);
	}

	function commit() {
		const total = readTypedMinutes();
		if (total === null) {
			showTypedMinutes(minutes);
			return;
		}
		if (total !== minutes) {
			onCommit(total);
		}
	}

	function shiftOnWheel(unit: DurationUnit, step: -1 | 1) {
		// Vers le haut (-1), la durée augmente
		showTypedMinutes(
			shiftDuration(readTypedMinutes() ?? minutes, unit, step === -1 ? 1 : -1),
		);
	}

	// ↑ ↓ changent la durée comme la molette, avec le report des minutes sur les heures ; Entrée valide
	function handleKeyDown(
		event: KeyboardEvent<HTMLInputElement>,
		unit: DurationUnit,
	) {
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			event.preventDefault();
			showTypedMinutes(
				shiftDuration(
					readTypedMinutes() ?? minutes,
					unit,
					event.key === "ArrowUp" ? 1 : -1,
				),
			);
			return;
		}
		blurOnEnter(event);
	}

	// Un pas natif du champ (molette ou flèche non interceptée) peut sortir les minutes de 0-59 : on reporte tout de suite sur les heures. La frappe n'est pas touchée
	function carryNativeStep(event: FormEvent<HTMLInputElement>) {
		if (event.nativeEvent instanceof InputEvent) return;
		const total = readTypedMinutes();
		if (total !== null) showTypedMinutes(total);
	}

	function isFocused(input: RefObject<HTMLInputElement | null>): boolean {
		return input.current !== null && document.activeElement === input.current;
	}

	useWheelStep(
		hoursRef,
		(step) => shiftOnWheel("hours", step),
		() => isFocused(hoursRef),
	);
	useWheelStep(
		minutesRef,
		(step) => shiftOnWheel("minutes", step),
		() => isFocused(minutesRef),
	);

	return (
		<span
			key={minutes}
			className={joinClassNames(styles.group, styles[variant], className)}
			onBlur={(event) => {
				// Passer des heures aux minutes n'enregistre rien : seulement en quittant les deux champs
				if (!(
					event.relatedTarget instanceof Node &&
					event.currentTarget.contains(event.relatedTarget)
				)) {
					commit();
				}
			}}
		>
			<input
				ref={hoursRef}
				type="number"
				className={styles.part}
				style={{ width: `${getHoursWidth(hours)}ch` }}
				min={0}
				step={1}
				defaultValue={hours}
				aria-label={`${label} : heures`}
				onKeyDown={(event) => handleKeyDown(event, "hours")}
			/>
			<span
				className={styles.unit}
				aria-hidden
			>
				h
			</span>
			<input
				ref={minutesRef}
				type="number"
				className={styles.part}
				style={{ width: `${MINUTES_WIDTH_CH}ch` }}
				min={0}
				step={1}
				defaultValue={extraMinutesText}
				aria-label={`${label} : minutes`}
				onInput={carryNativeStep}
				onKeyDown={(event) => handleKeyDown(event, "minutes")}
			/>
		</span>
	);
}
