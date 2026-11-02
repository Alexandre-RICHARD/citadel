import type { HTMLInputAutoCompleteAttribute } from "react";

import styles from "./textField.module.scss";

type Props = {
	id: string;
	value: string;
	onChange: (value: string) => void;
	type?: "text" | "email";
	autoComplete: HTMLInputAutoCompleteAttribute;
	isRequired?: boolean;
	isInvalid?: boolean;
	maxLength?: number;
	// Les caractères tapés ou collés qui ne doivent jamais entrer (les espaces d'une adresse email)
	stripPattern?: RegExp;
};

// Un champ de texte d'un formulaire du compte, colorié en rouge quand il a été refusé à l'envoi
export function TextField({
	id,
	value,
	onChange,
	type = "text",
	autoComplete,
	isRequired = false,
	isInvalid = false,
	maxLength,
	stripPattern,
}: Props) {
	return (
		<input
			id={id}
			name={id}
			className={styles.input}
			type={type}
			autoComplete={autoComplete}
			autoCapitalize="none"
			spellCheck={false}
			required={isRequired}
			aria-invalid={isInvalid}
			maxLength={maxLength}
			value={value}
			onChange={(event) =>
				onChange(
					stripPattern === undefined
						? event.target.value
						: event.target.value.replace(stripPattern, ""),
				)
			}
		/>
	);
}
