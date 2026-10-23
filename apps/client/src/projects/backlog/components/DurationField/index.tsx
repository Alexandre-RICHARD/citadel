import { useRef } from "react";

import { blurOnEnter, joinClassNames } from "../../utils";
import styles from "./durationField.module.scss";

type Props = {
	minutes: number;
	label: string;
	onCommit: (minutes: number) => void;
	/** Champ de formulaire, ou cellule du tableau : se lit comme sa valeur, le cadre n'apparaît qu'au survol */
	variant?: "field" | "inline";
	className?: string | undefined;
};

/** Durée saisie en heures et minutes, dans un seul cadre ; enregistrée en minutes quand le focus quitte les deux champs */
export function DurationField({
	minutes,
	label,
	onCommit,
	variant = "field",
	className,
}: Props) {
	const hoursRef = useRef<HTMLInputElement>(null);
	const minutesRef = useRef<HTMLInputElement>(null);
	const hours = Math.floor(minutes / 60);
	const extraMinutesText = String(minutes % 60).padStart(2, "0");

	function commit() {
		const hoursInput = hoursRef.current;
		const minutesInput = minutesRef.current;
		if (hoursInput === null || minutesInput === null) {
			return;
		}
		const typedHours = Number(hoursInput.value || "0");
		const typedMinutes = Number(minutesInput.value || "0");
		if (
			!Number.isInteger(typedHours) ||
			!Number.isInteger(typedMinutes) ||
			typedHours < 0 ||
			typedMinutes < 0
		) {
			hoursInput.value = String(hours);
			minutesInput.value = extraMinutesText;
			return;
		}
		const total = typedHours * 60 + typedMinutes;
		if (total !== minutes) {
			onCommit(total);
		}
	}

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
				style={{ width: `${Math.max(2, String(hours).length)}ch` }}
				min={0}
				step={1}
				defaultValue={hours}
				aria-label={`${label} : heures`}
				onKeyDown={blurOnEnter}
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
				style={{ width: "2ch" }}
				min={0}
				step={1}
				defaultValue={extraMinutesText}
				aria-label={`${label} : minutes`}
				onKeyDown={blurOnEnter}
			/>
		</span>
	);
}
