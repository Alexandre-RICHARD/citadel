import { useId } from "react";

import styles from "./rememberMeField.module.scss";

type Props = {
	isChecked: boolean;
	onChange: (isChecked: boolean) => void;
};

// « Se souvenir de moi », avec ce qu'il promet vraiment : les durées de la session, jamais une connexion éternelle
export function RememberMeField({ isChecked, onChange }: Props) {
	const id = useId();

	return (
		<div className={styles.field}>
			<input
				id={id}
				className={styles.checkbox}
				type="checkbox"
				checked={isChecked}
				aria-describedby={`${id}-hint`}
				onChange={(event) => onChange(event.target.checked)}
			/>
			<label
				className={styles.label}
				htmlFor={id}
			>
				Se souvenir de moi
			</label>
			<p
				id={`${id}-hint`}
				className={styles.hint}
			>
				Reste connecté 7 jours sans visite, 30 jours au plus.
			</p>
		</div>
	);
}
