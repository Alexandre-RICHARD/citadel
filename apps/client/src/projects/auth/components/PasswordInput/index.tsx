import { Eye, EyeOff } from "lucide-react";

import styles from "./passwordInput.module.scss";

type Props = {
	id: string;
	value: string;
	onChange: (value: string) => void;
	// new-password : le gestionnaire de mots de passe propose d'en créer et d'enregistrer celui-ci
	autoComplete: "new-password" | "current-password";
	isVisible: boolean;
	// Absent : pas d'œil sur ce champ (la confirmation suit celui du premier)
	onToggleVisibility?: () => void;
	isRequired?: boolean;
	isInvalid?: boolean;
	describedBy?: string;
};

// Un mot de passe, masqué par défaut ; l'œil l'affiche ou le masque
export function PasswordInput({
	id,
	value,
	onChange,
	autoComplete,
	isVisible,
	onToggleVisibility,
	isRequired = false,
	isInvalid = false,
	describedBy,
}: Props) {
	const toggleLabel = isVisible
		? "Masquer les mots de passe"
		: "Afficher les mots de passe";

	return (
		<div className={styles.wrapper}>
			<input
				id={id}
				name={id}
				className={styles.input}
				type={isVisible ? "text" : "password"}
				autoComplete={autoComplete}
				autoCapitalize="none"
				spellCheck={false}
				required={isRequired}
				aria-invalid={isInvalid}
				aria-describedby={describedBy}
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
			{onToggleVisibility !== undefined && (
				<button
					type="button"
					className={styles.toggle}
					onClick={onToggleVisibility}
					aria-label={toggleLabel}
					aria-pressed={isVisible}
					title={toggleLabel}
				>
					{isVisible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
				</button>
			)}
		</div>
	);
}
