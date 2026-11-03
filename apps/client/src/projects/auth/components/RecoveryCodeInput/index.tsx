import styles from "./recoveryCodeInput.module.scss";

type Props = {
	id: string;
	value: string;
	onChange: (value: string) => void;
	isInvalid?: boolean;
};

// Le tiret et les espaces comptés : « ABCDE-FGHIJ », ou recopié en deux fois
const RECOVERY_CODE_MAX_LENGTH = 16;

// Un code de secours, recopié du fichier téléchargé ou d'un papier : minuscules, tiret et espaces acceptés
export function RecoveryCodeInput({
	id,
	value,
	onChange,
	isInvalid = false,
}: Props) {
	return (
		<input
			id={id}
			name={id}
			className={styles.input}
			type="text"
			autoComplete="off"
			autoCapitalize="characters"
			spellCheck={false}
			placeholder="ABCDE-FGHIJ"
			required
			aria-invalid={isInvalid}
			maxLength={RECOVERY_CODE_MAX_LENGTH}
			value={value}
			onChange={(event) => onChange(event.target.value)}
		/>
	);
}
