import { changePasswordBodySchema } from "@citadel/specs/src/projects/auth/endpoint/me/changePassword/changePasswordBodySchema";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum";
import { KeyRound, Save } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

import { checkInput } from "../../../../../../common/validation/checkInput";
import { authFieldLabels } from "../../../../api/authFieldLabels";
import { useChangePassword } from "../../../../api/me/useChangePassword";
import { FormAlert } from "../../../../components/FormAlert";
import { FormField } from "../../../../components/FormField";
import { NewPasswordFields } from "../../../../components/NewPasswordFields";
import { PasswordInput } from "../../../../components/PasswordInput";
import { ProfileSection } from "../../../../components/ProfileSection";
import { SubmitButton } from "../../../../components/SubmitButton";
import { useAuthFailure } from "../../../../hooks/useAuthFailure";
import styles from "./passwordSection.module.scss";

// Le mot de passe actuel, puis le nouveau tapé deux fois, différent de l'actuel. Les autres sessions sont fermées
export function PasswordSection() {
	const fieldId = useId();
	const [currentPassword, setCurrentPassword] = useState("");
	const [isCurrentVisible, setIsCurrentVisible] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [confirmation, setConfirmation] = useState("");
	const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
	const [isChanged, setIsChanged] = useState(false);
	const changePassword = useChangePassword();
	const { waitUntil, failure, report, clear } = useAuthFailure(
		"changer ton mot de passe",
	);

	const check = checkInput(
		changePasswordBodySchema,
		{ currentPassword, newPassword },
		authFieldLabels,
	);
	const isConfirmed = confirmation === newPassword;

	function send(): void {
		clear();
		if (!check.isValid || currentPassword === "" || !isConfirmed) return;
		setIsChanged(false);
		changePassword.mutate(check.data, {
			onSuccess: () => {
				setCurrentPassword("");
				setNewPassword("");
				setConfirmation("");
				setHasTriedSubmit(false);
				setIsChanged(true);
			},
			onError: (error) => {
				if (report(error, send) === AuthErrorCodeEnum.WRONG_PASSWORD)
					setCurrentPassword("");
			},
		});
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		setHasTriedSubmit(true);
		send();
	}

	return (
		<ProfileSection
			icon={<KeyRound />}
			title="Mot de passe"
			lead="Le changer ferme toutes tes autres sessions."
		>
			<form
				className={styles.form}
				onSubmit={handleSubmit}
				noValidate
			>
				<FormField
					label="Mot de passe actuel"
					htmlFor={`${fieldId}-current`}
					isRequired
				>
					<PasswordInput
						id={`${fieldId}-current`}
						value={currentPassword}
						onChange={setCurrentPassword}
						autoComplete="current-password"
						isVisible={isCurrentVisible}
						onToggleVisibility={() =>
							setIsCurrentVisible((current) => !current)
						}
						isRequired
						isInvalid={hasTriedSubmit && currentPassword === ""}
					/>
				</FormField>
				<NewPasswordFields
					label="Nouveau mot de passe"
					password={newPassword}
					confirmation={confirmation}
					onPasswordChange={setNewPassword}
					onConfirmationChange={setConfirmation}
					isPasswordInvalid={hasTriedSubmit && !check.isValid}
				/>
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
				{isChanged && (
					<FormAlert tone="info">
						Mot de passe changé. Tes autres sessions ont été fermées.
					</FormAlert>
				)}
				<SubmitButton
					label="Changer mon mot de passe"
					pendingLabel="Changement…"
					icon={<Save aria-hidden />}
					isPending={changePassword.isPending}
					waitUntil={waitUntil}
					isDisabled={
						currentPassword === "" || newPassword === "" || !isConfirmed
					}
				/>
			</form>
		</ProfileSection>
	);
}
