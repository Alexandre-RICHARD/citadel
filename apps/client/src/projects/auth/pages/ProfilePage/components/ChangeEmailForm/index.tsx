import { AUTH_FIELD_LENGTHS } from "@citadel/specs/src/projects/auth/authFieldLengths";
import { startEmailChangeBodySchema } from "@citadel/specs/src/projects/auth/endpoint/me/startEmailChange/startEmailChangeBodySchema";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum";
import { AtSign, Mail } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

import { useIsMailSendingOpen } from "../../../../../../common/api/mail/useIsMailSendingOpen";
import { checkInput } from "../../../../../../common/validation/checkInput";
import { authFieldLabels } from "../../../../api/authFieldLabels";
import { useStartEmailChange } from "../../../../api/me/useStartEmailChange";
import { FormAlert } from "../../../../components/FormAlert";
import { FormField } from "../../../../components/FormField";
import { PasswordInput } from "../../../../components/PasswordInput";
import { SubmitButton } from "../../../../components/SubmitButton";
import { TextField } from "../../../../components/TextField";
import { useAuthFailure } from "../../../../hooks/useAuthFailure";
import styles from "./changeEmailForm.module.scss";

// Le mot de passe et la nouvelle adresse. Le mail de confirmation part à celle-ci ; la page passe ensuite à l'étape
// « lien ou code » (le parcours en cours)
export function ChangeEmailForm() {
	const fieldId = useId();
	const [isOpen, setIsOpen] = useState(false);
	const [newEmail, setNewEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isVisible, setIsVisible] = useState(false);
	const isMailOpen = useIsMailSendingOpen();
	const startEmailChange = useStartEmailChange();
	const { waitUntil, failure, report, clear } = useAuthFailure(
		"changer ton adresse email",
	);

	const check = checkInput(
		startEmailChangeBodySchema,
		{ password, newEmail },
		authFieldLabels,
	);

	function send(): void {
		if (!check.isValid || password === "") return;
		clear();
		startEmailChange.mutate(check.data, {
			onError: (error) => {
				if (report(error, send) === AuthErrorCodeEnum.WRONG_PASSWORD)
					setPassword("");
			},
		});
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		send();
	}

	if (!isOpen)
		return (
			<div className={styles.closed}>
				<button
					type="button"
					className={styles.open}
					onClick={() => setIsOpen(true)}
					disabled={!isMailOpen}
				>
					<AtSign aria-hidden />
					Changer mon adresse email
				</button>
				{!isMailOpen && (
					<p className={styles.hint}>
						Plus aucun email ne part aujourd’hui : réessaie demain.
					</p>
				)}
			</div>
		);

	return (
		<form
			className={styles.form}
			onSubmit={handleSubmit}
			noValidate
		>
			<FormField
				label="Nouvelle adresse email"
				htmlFor={`${fieldId}-email`}
				isRequired
			>
				<TextField
					id={`${fieldId}-email`}
					type="email"
					value={newEmail}
					onChange={setNewEmail}
					autoComplete="email"
					maxLength={AUTH_FIELD_LENGTHS.emailMax}
					stripPattern={/\s/gu}
					isRequired
				/>
				<p className={styles.hint}>
					Un email avec un lien et un code part à cette adresse. Elle remplace
					l’actuelle une fois confirmée, et l’ancienne en est prévenue.
				</p>
			</FormField>
			<FormField
				label="Ton mot de passe"
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
					label="Recevoir l’email de confirmation"
					pendingLabel="Envoi…"
					icon={<Mail aria-hidden />}
					isPending={startEmailChange.isPending}
					waitUntil={waitUntil}
					isDisabled={!check.isValid || !isMailOpen}
				/>
				<button
					type="button"
					className={styles.cancel}
					onClick={() => setIsOpen(false)}
				>
					Annuler
				</button>
			</div>
		</form>
	);
}
