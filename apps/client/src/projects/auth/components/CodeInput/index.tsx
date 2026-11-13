import styles from "./codeInput.module.scss";

type Props = {
	id: string;
	value: string;
	onChange: (value: string) => void;
	isInvalid?: boolean;
	isDisabled?: boolean;
};

// Le code reçu par email : 6 chiffres, proposés par le clavier du téléphone (one-time-code). Collé avec des espaces ou
// un retour à la ligne, il reste accepté : le serveur les retire
export function CodeInput({
	id,
	value,
	onChange,
	isInvalid = false,
	isDisabled = false,
}: Props) {
	return (
		<input
			id={id}
			name={id}
			className={styles.input}
			type="text"
			inputMode="numeric"
			autoComplete="one-time-code"
			placeholder="123456"
			required
			disabled={isDisabled}
			aria-invalid={isInvalid}
			maxLength={12}
			value={value}
			onChange={(event) => onChange(event.target.value)}
		/>
	);
}
