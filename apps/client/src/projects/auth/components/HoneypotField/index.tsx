import { useId } from "react";

import styles from "./honeypotField.module.scss";

type Props = {
	value: string;
	onChange: (value: string) => void;
};

// Le champ piège : hors de l'écran et du parcours au clavier, seul un robot le remplit
export function HoneypotField({ value, onChange }: Props) {
	const id = useId();

	return (
		<div
			className={styles.trap}
			aria-hidden
		>
			<label htmlFor={id}>Site web (laisser vide)</label>
			<input
				id={id}
				type="text"
				name="website"
				tabIndex={-1}
				autoComplete="off"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
		</div>
	);
}
