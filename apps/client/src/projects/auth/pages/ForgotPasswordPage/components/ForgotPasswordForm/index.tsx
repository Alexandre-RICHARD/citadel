import { AUTH_FIELD_LENGTHS } from "@citadel/specs/src/projects/auth/authFieldLengths";
import { startPasswordResetBodySchema } from "@citadel/specs/src/projects/auth/endpoint/passwordResets/startPasswordReset/startPasswordResetBodySchema";
import { KeyRound, Send } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { Link } from "react-router";

import { checkInput } from "../../../../../../common/validation/checkInput";
import { authFieldLabels } from "../../../../api/authFieldLabels";
import { useStartPasswordReset } from "../../../../api/passwordReset/useStartPasswordReset";
import { AuthCard } from "../../../../components/AuthCard";
import { FormAlert } from "../../../../components/FormAlert";
import { FormField } from "../../../../components/FormField";
import { SubmitButton } from "../../../../components/SubmitButton";
import { TextField } from "../../../../components/TextField";
import { useAuthFailure } from "../../../../hooks/useAuthFailure";
import { useStoredFields } from "../../../../hooks/useStoredFields";
import { AuthPathEnum } from "../../../../routing/authPath.enum";
import styles from "./forgotPasswordForm.module.scss";

type ForgotPasswordFields = {
	identifier: string;
};

const FORGOT_PASSWORD_FIELDS_KEY = "citadel:auth:forgot-password";
const EMPTY_FORGOT_PASSWORD_FIELDS: ForgotPasswordFields = { identifier: "" };

// La demande : un identifiant, et la même réponse qu'un compte existe ou non. L'adresse du compte n'est jamais affichée
export function ForgotPasswordForm() {
	const fieldId = useId();
	const { fields, update } = useStoredFields(
		FORGOT_PASSWORD_FIELDS_KEY,
		EMPTY_FORGOT_PASSWORD_FIELDS,
	);
	const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
	const passwordReset = useStartPasswordReset();
	const { waitUntil, failure, report, clear } =
		useAuthFailure("envoyer l’email");

	const check = checkInput(
		startPasswordResetBodySchema,
		{ identifier: fields.identifier },
		authFieldLabels,
	);

	function send(): void {
		if (!check.isValid) return;
		clear();
		passwordReset.mutate(check.data, {
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
			icon={<KeyRound />}
			title="Mot de passe oublié"
			lead="Indique ton adresse email ou ton pseudo : tu recevras un lien et un code pour choisir un nouveau mot de passe."
			footer={
				<p>
					Tu t’en souviens ? <Link to={AuthPathEnum.LOGIN}>Se connecter</Link>
				</p>
			}
		>
			<form
				className={styles.form}
				onSubmit={handleSubmit}
				noValidate
			>
				<FormField
					label="Adresse email ou pseudo"
					htmlFor={`${fieldId}-identifier`}
					isRequired
				>
					<TextField
						id={`${fieldId}-identifier`}
						autoComplete="username"
						value={fields.identifier}
						onChange={(identifier) => update("identifier", identifier)}
						maxLength={AUTH_FIELD_LENGTHS.emailMax}
						isRequired
						isInvalid={hasTriedSubmit && !check.isValid}
					/>
				</FormField>
				{hasTriedSubmit && !check.isValid && (
					<FormAlert tone="error">{check.message}</FormAlert>
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
					label="Recevoir l’email"
					pendingLabel="Envoi…"
					icon={<Send aria-hidden />}
					isPending={passwordReset.isPending}
					waitUntil={waitUntil}
				/>
			</form>
		</AuthCard>
	);
}
