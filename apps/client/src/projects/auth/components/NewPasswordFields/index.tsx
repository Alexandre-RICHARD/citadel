import { useId, useState } from "react";

import { FormField } from "../FormField";
import { PasswordConditions } from "../PasswordConditions";
import { PasswordInput } from "../PasswordInput";
import { PasswordStrengthMeter } from "../PasswordStrengthMeter";
import styles from "./newPasswordFields.module.scss";

type Props = {
	password: string;
	confirmation: string;
	onPasswordChange: (password: string) => void;
	onConfirmationChange: (confirmation: string) => void;
	// Après un premier envoi : les champs refusés passent en rouge
	isPasswordInvalid: boolean;
	label?: string;
};

/**
 * Un nouveau mot de passe, tapé deux fois : la barre de force et les conditions sous le premier champ, la différence
 * signalée sous le second, un seul œil pour afficher ou masquer les deux
 */
export function NewPasswordFields({
	password,
	confirmation,
	onPasswordChange,
	onConfirmationChange,
	isPasswordInvalid,
	label = "Mot de passe",
}: Props) {
	const fieldId = useId();
	const [isVisible, setIsVisible] = useState(false);
	const isMismatch = confirmation !== "" && confirmation !== password;

	return (
		<>
			<FormField
				label={label}
				htmlFor={`${fieldId}-password`}
				isRequired
			>
				<PasswordInput
					id={`${fieldId}-password`}
					value={password}
					onChange={onPasswordChange}
					autoComplete="new-password"
					isVisible={isVisible}
					onToggleVisibility={() => setIsVisible((current) => !current)}
					isRequired
					isInvalid={isPasswordInvalid}
					describedBy={`${fieldId}-conditions`}
				/>
				<PasswordStrengthMeter password={password} />
				<PasswordConditions
					id={`${fieldId}-conditions`}
					password={password}
				/>
			</FormField>
			<FormField
				label="Confirmation du mot de passe"
				htmlFor={`${fieldId}-confirmation`}
				isRequired
			>
				<PasswordInput
					id={`${fieldId}-confirmation`}
					value={confirmation}
					onChange={onConfirmationChange}
					autoComplete="new-password"
					isVisible={isVisible}
					isRequired
					isInvalid={isMismatch}
					describedBy={`${fieldId}-mismatch`}
				/>
				<p
					id={`${fieldId}-mismatch`}
					className={styles.mismatch}
					aria-live="polite"
				>
					{isMismatch ? "Les deux mots de passe sont différents." : ""}
				</p>
			</FormField>
			<p className={styles.advice}>
				Utilise un mot de passe différent pour chaque site, idéalement avec un
				gestionnaire de mots de passe.
			</p>
		</>
	);
}
