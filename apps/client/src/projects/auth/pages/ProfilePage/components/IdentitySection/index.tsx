import { AUTH_FIELD_LENGTHS } from "@citadel/specs/src/projects/auth/authFieldLengths";
import { updateMeBodySchema } from "@citadel/specs/src/projects/auth/endpoint/me/updateMe/updateMeBodySchema";
import { Check, Save } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

import { checkInput } from "../../../../../../common/validation/checkInput";
import { authFieldLabels } from "../../../../api/authFieldLabels";
import { useUpdateMe } from "../../../../api/me/useUpdateMe";
import type { MeFm } from "../../../../api/model/meFm.type";
import { FormAlert } from "../../../../components/FormAlert";
import { FormField } from "../../../../components/FormField";
import { SubmitButton } from "../../../../components/SubmitButton";
import { TextField } from "../../../../components/TextField";
import { useAuthFailure } from "../../../../hooks/useAuthFailure";
import { ChangeEmailForm } from "../ChangeEmailForm";
import { ProfileSubsection } from "../ProfileSubsection";
import styles from "./identitySection.module.scss";

type Props = {
	me: MeFm;
};

// La catégorie Identité : le pseudo (définitif), le pseudo affiché (modifiable, vide : le pseudo en tient lieu) et l'adresse email
export function IdentitySection({ me }: Props) {
	const fieldId = useId();
	const [displayName, setDisplayName] = useState(me.customDisplayName ?? "");
	const [isSaved, setIsSaved] = useState(false);
	const updateMe = useUpdateMe();
	const { waitUntil, failure, report, clear } = useAuthFailure(
		"enregistrer ton pseudo affiché",
	);

	const check = checkInput(
		updateMeBodySchema,
		{ displayName },
		authFieldLabels,
	);
	const isUnchanged = check.isValid
		? (check.data.displayName ?? null) === me.customDisplayName
		: false;

	function save(): void {
		if (!check.isValid || isUnchanged) return;
		clear();
		setIsSaved(false);
		updateMe.mutate(check.data, {
			onSuccess: () => setIsSaved(true),
			onError: (error) => {
				report(error, save);
			},
		});
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		save();
	}

	return (
		<>
			<ProfileSubsection
				title="Pseudo"
				lead="Ton pseudo ne change pas ; le pseudo affiché, si."
			>
				<p className={styles.value}>{me.username}</p>
				<form
					className={styles.form}
					onSubmit={handleSubmit}
					noValidate
				>
					<div className={styles.row}>
						<FormField
							label="Pseudo affiché"
							htmlFor={`${fieldId}-display-name`}
						>
							<TextField
								id={`${fieldId}-display-name`}
								value={displayName}
								onChange={(value) => {
									setDisplayName(value);
									setIsSaved(false);
								}}
								autoComplete="nickname"
								maxLength={AUTH_FIELD_LENGTHS.displayNameMax * 2}
								isInvalid={!check.isValid}
							/>
						</FormField>
						<SubmitButton
							label="Enregistrer"
							pendingLabel="Enregistrement…"
							icon={<Save aria-hidden />}
							isPending={updateMe.isPending}
							waitUntil={waitUntil}
							isDisabled={!check.isValid || isUnchanged}
						/>
					</div>
					<p className={styles.hint}>
						Accents, espaces et symboles permis. Laisse vide pour afficher ton
						pseudo.
					</p>
					{!check.isValid && (
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
					{isSaved && (
						<FormAlert tone="info">
							<Check
								aria-hidden
								className={styles.check}
							/>{" "}
							Pseudo affiché enregistré.
						</FormAlert>
					)}
				</form>
			</ProfileSubsection>
			<ProfileSubsection title="Adresse email">
				<p className={styles.value}>{me.email}</p>
				<ChangeEmailForm />
			</ProfileSubsection>
		</>
	);
}
