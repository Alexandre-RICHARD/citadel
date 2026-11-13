import { AUTH_FIELD_LENGTHS } from "@citadel/specs/src/projects/auth/authFieldLengths";
import { loginWithPasswordBodySchema } from "@citadel/specs/src/projects/auth/endpoint/login/loginWithPassword/loginWithPasswordBodySchema";
import { startMailLoginBodySchema } from "@citadel/specs/src/projects/auth/endpoint/login/startMailLogin/startMailLoginBodySchema";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum";
import { KeyRound, LogIn, Mail } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { Link } from "react-router";

import { checkInput } from "../../../../../../common/validation/checkInput";
import { authFieldLabels } from "../../../../api/authFieldLabels";
import { useLoginWithPassword } from "../../../../api/login/useLoginWithPassword";
import { useStartMailLogin } from "../../../../api/login/useStartMailLogin";
import { AuthCard } from "../../../../components/AuthCard";
import { FormAlert } from "../../../../components/FormAlert";
import { FormField } from "../../../../components/FormField";
import { PasswordInput } from "../../../../components/PasswordInput";
import { RememberMeField } from "../../../../components/RememberMeField";
import { SubmitButton } from "../../../../components/SubmitButton";
import { TextField } from "../../../../components/TextField";
import { useAuthFailure } from "../../../../hooks/useAuthFailure";
import { useStoredFields } from "../../../../hooks/useStoredFields";
import { AuthPathEnum } from "../../../../routing/authPath.enum";
import styles from "./loginForm.module.scss";

type LoginFields = {
	identifier: string;
	remember: boolean;
	// Par mot de passe, ou par un lien reçu par email
	isMailLogin: boolean;
};

const LOGIN_FIELDS_KEY = "citadel:auth:login";
const EMPTY_LOGIN_FIELDS: LoginFields = {
	identifier: "",
	remember: false,
	isMailLogin: false,
};

/**
 * La connexion, par email ou pseudo et mot de passe, ou par un lien reçu par email. Identifiant inconnu et mauvais mot
 * de passe donnent le même message ; après un échec, le bouton patiente le délai imposé par le serveur
 */
export function LoginForm() {
	const fieldId = useId();
	const { fields, update } = useStoredFields(
		LOGIN_FIELDS_KEY,
		EMPTY_LOGIN_FIELDS,
	);
	const [password, setPassword] = useState("");
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
	const passwordLogin = useLoginWithPassword();
	const mailLogin = useStartMailLogin();
	const passwordFailure = useAuthFailure("vous connecter");
	const mailFailure = useAuthFailure("envoyer le lien de connexion");
	const { isMailLogin } = fields;
	const { waitUntil, failure, report, clear } = isMailLogin
		? mailFailure
		: passwordFailure;

	const passwordCheck = checkInput(
		loginWithPasswordBodySchema,
		{ identifier: fields.identifier, password, remember: fields.remember },
		authFieldLabels,
	);
	const mailCheck = checkInput(
		startMailLoginBodySchema,
		{ identifier: fields.identifier, remember: fields.remember },
		authFieldLabels,
	);
	const check = isMailLogin ? mailCheck : passwordCheck;
	const isIdentifierMissing = fields.identifier.trim() === "";

	function send(): void {
		clear();
		if (isMailLogin) {
			if (!mailCheck.isValid) return;
			mailLogin.mutate(mailCheck.data, {
				onError: (error) => {
					report(error, send);
				},
			});
			return;
		}
		if (!passwordCheck.isValid || password === "") return;
		passwordLogin.mutate(passwordCheck.data, {
			onError: (error) => {
				if (report(error, send) === AuthErrorCodeEnum.INVALID_CREDENTIALS)
					setPassword("");
			},
		});
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		setHasTriedSubmit(true);
		send();
	}

	function switchMode(): void {
		setHasTriedSubmit(false);
		update("isMailLogin", !isMailLogin);
	}

	return (
		<AuthCard
			icon={isMailLogin ? <Mail /> : <LogIn />}
			title="Se connecter"
			lead={
				isMailLogin
					? "Recevez un lien et un code par email : pas besoin de mot de passe."
					: "Avec votre adresse email ou votre pseudo."
			}
			footer={
				<p>
					Pas encore de compte ?{" "}
					<Link to={AuthPathEnum.REGISTER}>Créer un compte</Link>
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
						isInvalid={hasTriedSubmit && isIdentifierMissing}
					/>
				</FormField>
				{!isMailLogin && (
					<FormField
						label="Mot de passe"
						htmlFor={`${fieldId}-password`}
						isRequired
						aside={
							<Link
								className={styles.inlineLink}
								to={AuthPathEnum.FORGOT_PASSWORD}
							>
								Mot de passe oublié ?
							</Link>
						}
					>
						<PasswordInput
							id={`${fieldId}-password`}
							value={password}
							onChange={setPassword}
							autoComplete="current-password"
							isVisible={isPasswordVisible}
							onToggleVisibility={() =>
								setIsPasswordVisible((current) => !current)
							}
							isRequired
							isInvalid={hasTriedSubmit && password === ""}
						/>
					</FormField>
				)}
				<RememberMeField
					isChecked={fields.remember}
					onChange={(remember) => update("remember", remember)}
				/>
				<div
					className={styles.feedback}
					aria-live="polite"
				>
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
				</div>
				<SubmitButton
					label={isMailLogin ? "Recevoir le lien" : "Se connecter"}
					pendingLabel={isMailLogin ? "Envoi…" : "Connexion…"}
					icon={isMailLogin ? <Mail aria-hidden /> : <LogIn aria-hidden />}
					isPending={
						isMailLogin ? mailLogin.isPending : passwordLogin.isPending
					}
					waitUntil={waitUntil}
				/>
				<div className={styles.separator}>
					<span>ou</span>
				</div>
				<button
					type="button"
					className={styles.switchButton}
					onClick={switchMode}
				>
					{isMailLogin ? (
						<>
							<KeyRound aria-hidden />
							Me connecter avec mon mot de passe
						</>
					) : (
						<>
							<Mail aria-hidden />
							Recevoir un lien de connexion par email
						</>
					)}
				</button>
			</form>
		</AuthCard>
	);
}
