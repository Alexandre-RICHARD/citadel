import { submitNewPasswordBodySchema } from "@citadel/specs/src/projects/auth/endpoint/flow/submitNewPassword/submitNewPasswordBodySchema";
import { Check, LockKeyhole } from "lucide-react";
import { type FormEvent, useState } from "react";

import { checkInput } from "../../../../../../common/validation/checkInput";
import { authFieldLabels } from "../../../../api/authFieldLabels";
import { useSubmitNewPassword } from "../../../../api/flow/useSubmitNewPassword";
import { AuthCard } from "../../../../components/AuthCard";
import { FormAlert } from "../../../../components/FormAlert";
import { NewPasswordFields } from "../../../../components/NewPasswordFields";
import { SubmitButton } from "../../../../components/SubmitButton";
import { useAuthFailure } from "../../../../hooks/useAuthFailure";
import styles from "./newPasswordForm.module.scss";

// Le nouveau mot de passe, deux fois, différent de l'actuel. Toutes les sessions du compte se ferment, celle-ci s'ouvre
export function NewPasswordForm() {
	const [password, setPassword] = useState("");
	const [confirmation, setConfirmation] = useState("");
	const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
	const newPassword = useSubmitNewPassword();
	const { waitUntil, failure, report, clear } = useAuthFailure(
		"changer votre mot de passe",
	);

	const check = checkInput(
		submitNewPasswordBodySchema,
		{ password },
		authFieldLabels,
	);
	const isMismatch = confirmation !== password;

	function send(): void {
		if (!check.isValid || isMismatch) return;
		clear();
		newPassword.mutate(check.data, {
			onError: (error) => {
				report(error, send);
			},
		});
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		setHasTriedSubmit(true);
		send();
	}

	return (
		<AuthCard
			icon={<LockKeyhole />}
			title="Choisissez un nouveau mot de passe"
			lead="Toutes les sessions ouvertes sur votre compte seront fermées, puis vous serez connecté ici."
		>
			<form
				className={styles.form}
				onSubmit={handleSubmit}
				noValidate
			>
				<NewPasswordFields
					label="Nouveau mot de passe"
					password={password}
					confirmation={confirmation}
					onPasswordChange={setPassword}
					onConfirmationChange={setConfirmation}
					isPasswordInvalid={hasTriedSubmit && !check.isValid}
				/>
				{hasTriedSubmit && !check.isValid && (
					<FormAlert tone="error">{check.message}</FormAlert>
				)}
				{hasTriedSubmit && check.isValid && isMismatch && (
					<FormAlert tone="error">
						Les deux mots de passe sont différents.
					</FormAlert>
				)}
				{failure !== null && (
					<FormAlert
						tone="error"
						onRetry={failure.retry}
					>
						{failure.message}
					</FormAlert>
				)}
				<SubmitButton
					label="Enregistrer et me connecter"
					pendingLabel="Enregistrement…"
					icon={<Check aria-hidden />}
					isPending={newPassword.isPending}
					waitUntil={waitUntil}
				/>
			</form>
		</AuthCard>
	);
}
