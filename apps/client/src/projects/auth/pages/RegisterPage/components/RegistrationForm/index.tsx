import { AUTH_FIELD_LENGTHS } from "@citadel/specs/src/projects/auth/authFieldLengths";
import { startRegistrationBodySchema } from "@citadel/specs/src/projects/auth/endpoint/registrations/startRegistration/startRegistrationBodySchema";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum";
import { usernameSchema } from "@citadel/specs/src/projects/auth/schema/usernameSchema";
import { Check, Search, UserPlus, X } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { Link } from "react-router";

import { useIsRegistrationOpen } from "../../../../../../common/api/mail/useIsRegistrationOpen";
import { checkInput } from "../../../../../../common/validation/checkInput";
import { listInvalidFields } from "../../../../../../common/validation/listInvalidFields";
import { authFieldLabels } from "../../../../api/authFieldLabels";
import { useStartRegistration } from "../../../../api/registration/useStartRegistration";
import { useCheckUsernameAvailability } from "../../../../api/username/useCheckUsernameAvailability";
import { AuthCard } from "../../../../components/AuthCard";
import { FormAlert } from "../../../../components/FormAlert";
import { FormField } from "../../../../components/FormField";
import { HoneypotField } from "../../../../components/HoneypotField";
import { NewPasswordFields } from "../../../../components/NewPasswordFields";
import { RememberMeField } from "../../../../components/RememberMeField";
import { SubmitButton } from "../../../../components/SubmitButton";
import { TextField } from "../../../../components/TextField";
import { useAuthFailure } from "../../../../hooks/useAuthFailure";
import { useStoredFields } from "../../../../hooks/useStoredFields";
import { AuthPathEnum } from "../../../../routing/authPath.enum";
import { EMPTY_REGISTRATION_FIELDS } from "../../emptyRegistrationFields";
import { REGISTRATION_FIELDS_KEY } from "../../registrationFieldsKey";
import styles from "./registrationForm.module.scss";

// Une adresse email n'a jamais d'espace : il ne peut pas être tapé, ni collé
const SPACES = /\s/gu;

type CheckedUsername = {
	username: string;
	isAvailable: boolean;
};

/**
 * Le formulaire d'inscription. Les champs refusés passent en rouge à l'envoi ; la réponse est la même que l'adresse
 * soit nouvelle ou déjà inscrite (l'email dit la vérité, dans la seule boîte concernée). Fermé par l'interrupteur ou le
 * quota d'emails, il reste visible, désactivé
 */
export function RegistrationForm() {
	const fieldId = useId();
	const isRegistrationOpen = useIsRegistrationOpen();
	const { fields, update } = useStoredFields(
		REGISTRATION_FIELDS_KEY,
		EMPTY_REGISTRATION_FIELDS,
	);
	const [password, setPassword] = useState("");
	const [confirmation, setConfirmation] = useState("");
	const [website, setWebsite] = useState("");
	const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
	const [checkedUsername, setCheckedUsername] =
		useState<CheckedUsername | null>(null);
	// Le pseudo refusé par le serveur (pris), en rouge tant qu'il n'a pas changé
	const [takenUsername, setTakenUsername] = useState<string | null>(null);
	const registration = useStartRegistration();
	const availability = useCheckUsernameAvailability();
	const { waitUntil, failure, report, clear } = useAuthFailure(
		"commencer votre inscription",
	);
	const availabilityFailure = useAuthFailure("vérifier ce pseudo");

	const body = {
		email: fields.email,
		username: fields.username,
		password,
		remember: fields.remember,
		website,
	};
	const check = checkInput(startRegistrationBodySchema, body, authFieldLabels);
	const invalidFields = hasTriedSubmit
		? listInvalidFields(startRegistrationBodySchema, body)
		: new Set<string>();
	const isMismatch = confirmation !== password;
	const isUsernameWellFormed = usernameSchema.safeParse(
		fields.username,
	).success;
	const availabilityResult =
		checkedUsername?.username === fields.username ? checkedUsername : null;

	function send(): void {
		if (!check.isValid || isMismatch || !isRegistrationOpen) return;
		clear();
		registration.mutate(check.data, {
			onError: (error) => {
				if (report(error, send) === AuthErrorCodeEnum.USERNAME_TAKEN)
					setTakenUsername(fields.username);
			},
		});
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		setHasTriedSubmit(true);
		send();
	}

	function checkAvailability(): void {
		const { username } = fields;
		availabilityFailure.clear();
		availability.mutate(username, {
			onSuccess: (isAvailable) => {
				setCheckedUsername({ username, isAvailable });
			},
			onError: (error) => {
				availabilityFailure.report(error, checkAvailability);
			},
		});
	}

	return (
		<AuthCard
			icon={<UserPlus />}
			title="Créer un compte"
			lead="Un seul compte pour tous les projets du site."
			footer={
				<p>
					Déjà un compte ? <Link to={AuthPathEnum.LOGIN}>Se connecter</Link>
				</p>
			}
		>
			<form
				className={styles.form}
				onSubmit={handleSubmit}
				noValidate
			>
				{!isRegistrationOpen && (
					<FormAlert tone="info">
						Les inscriptions sont fermées pour aujourd’hui, elles rouvrent
						demain.
					</FormAlert>
				)}
				<fieldset
					className={styles.fieldset}
					disabled={!isRegistrationOpen}
				>
					<legend className={styles.legend}>Votre futur compte</legend>
					<FormField
						label="Adresse email"
						htmlFor={`${fieldId}-email`}
						isRequired
					>
						<TextField
							id={`${fieldId}-email`}
							type="email"
							autoComplete="email"
							value={fields.email}
							onChange={(email) => update("email", email)}
							stripPattern={SPACES}
							maxLength={AUTH_FIELD_LENGTHS.emailMax}
							isRequired
							isInvalid={invalidFields.has("email")}
						/>
					</FormField>
					<FormField
						label="Pseudo"
						htmlFor={`${fieldId}-username`}
						isRequired
						aside={
							<button
								type="button"
								className={styles.availabilityButton}
								onClick={checkAvailability}
								disabled={!isUsernameWellFormed || availability.isPending}
							>
								<Search aria-hidden />
								{availability.isPending
									? "Vérification…"
									: "Vérifier la disponibilité"}
							</button>
						}
					>
						<TextField
							id={`${fieldId}-username`}
							autoComplete="username"
							value={fields.username}
							onChange={(username) => update("username", username)}
							maxLength={AUTH_FIELD_LENGTHS.usernameMax}
							isRequired
							isInvalid={
								invalidFields.has("username") ||
								takenUsername === fields.username ||
								availabilityResult?.isAvailable === false
							}
						/>
						<p
							className={styles.usernameStatus}
							aria-live="polite"
						>
							{availabilityResult === null ? (
								<span className={styles.hint}>
									Lettres sans accent, chiffres, « _ » et « - ». Définitif : il
									ne pourra plus changer, contrairement au pseudo affiché.
								</span>
							) : availabilityResult.isAvailable ? (
								<span className={styles.available}>
									<Check aria-hidden />
									Ce pseudo est libre.
								</span>
							) : (
								<span className={styles.taken}>
									<X aria-hidden />
									Ce pseudo est déjà pris.
								</span>
							)}
						</p>
						{availabilityFailure.failure !== null && (
							<FormAlert
								tone="error"
								onRetry={availabilityFailure.failure.retry}
							>
								{availabilityFailure.failure.message}
							</FormAlert>
						)}
					</FormField>
					<NewPasswordFields
						password={password}
						confirmation={confirmation}
						onPasswordChange={setPassword}
						onConfirmationChange={setConfirmation}
						isPasswordInvalid={invalidFields.has("password")}
					/>
					<RememberMeField
						isChecked={fields.remember}
						onChange={(remember) => update("remember", remember)}
					/>
					<HoneypotField
						value={website}
						onChange={setWebsite}
					/>
					<div
						className={styles.feedback}
						aria-live="polite"
					>
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
					</div>
					<SubmitButton
						label="Créer mon compte"
						pendingLabel="Envoi…"
						icon={<UserPlus aria-hidden />}
						isPending={registration.isPending}
						waitUntil={waitUntil}
					/>
					<p className={styles.hint}>
						Vous avez 30 minutes pour terminer votre inscription, sinon il
						faudra recommencer.
					</p>
				</fieldset>
			</form>
		</AuthCard>
	);
}
