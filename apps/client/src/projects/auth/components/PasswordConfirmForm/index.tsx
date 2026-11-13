import { type FormEvent, type ReactNode, useId, useState } from "react";

import { useAuthFailure } from "../../hooks/useAuthFailure";
import { FormAlert } from "../FormAlert";
import { FormField } from "../FormField";
import { PasswordInput } from "../PasswordInput";
import { SubmitButton } from "../SubmitButton";
import styles from "./passwordConfirmForm.module.scss";

type MutateOptions = {
	onSuccess: () => void;
	onError: (error: unknown) => void;
};

type Props = {
	// Ce que le mot de passe autorise, dans le message d'échec : « retirer ce facteur »
	actionLabel: string;
	confirmLabel: string;
	pendingLabel: string;
	icon: ReactNode;
	isPending: boolean;
	// Envoie l'action avec le mot de passe tapé, puis appelle l'un des deux rappels
	onConfirm: (password: string, options: MutateOptions) => void;
	// L'action est faite : le formulaire se referme
	onDone: () => void;
	onCancel: () => void;
	// Entre le mot de passe et les boutons : un champ de plus (le code d'un second facteur)
	children?: ReactNode;
	isDisabled?: boolean;
	// Le bouton de confirmation en rouge : une action qu'on ne peut pas défaire
	isDanger?: boolean;
};

// Le mot de passe redemandé avant une action sensible. Un mot de passe faux impose le délai de la connexion, bouton compris
export function PasswordConfirmForm({
	actionLabel,
	confirmLabel,
	pendingLabel,
	icon,
	isPending,
	onConfirm,
	onDone,
	onCancel,
	children,
	isDisabled = false,
	isDanger = false,
}: Props) {
	const fieldId = useId();
	const [password, setPassword] = useState("");
	const [isVisible, setIsVisible] = useState(false);
	const { waitUntil, failure, report, clear } = useAuthFailure(actionLabel);

	function send(): void {
		if (password === "") return;
		clear();
		onConfirm(password, {
			onSuccess: onDone,
			onError: (error) => {
				report(error, send);
			},
		});
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		send();
	}

	return (
		<form
			className={styles.form}
			data-danger={isDanger}
			onSubmit={handleSubmit}
			noValidate
		>
			<FormField
				label="Votre mot de passe"
				htmlFor={`${fieldId}-password`}
				isRequired
			>
				<PasswordInput
					id={`${fieldId}-password`}
					value={password}
					onChange={setPassword}
					autoComplete="current-password"
					isVisible={isVisible}
					onToggleVisibility={() => setIsVisible((current) => !current)}
					isRequired
				/>
			</FormField>
			{children}
			{failure !== null && (
				<FormAlert
					tone="error"
					onRetry={failure.retry}
				>
					{failure.message}
				</FormAlert>
			)}
			<div className={styles.actions}>
				<SubmitButton
					label={confirmLabel}
					pendingLabel={pendingLabel}
					icon={icon}
					isPending={isPending}
					waitUntil={waitUntil}
					isDisabled={password === "" || isDisabled}
				/>
				<button
					type="button"
					className={styles.cancel}
					onClick={onCancel}
				>
					Annuler
				</button>
			</div>
		</form>
	);
}
