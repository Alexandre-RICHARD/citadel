import { createTotpFactorBodySchema } from "@citadel/specs/src/projects/auth/endpoint/factors/createTotpFactor/createTotpFactorBodySchema";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum";
import { totpCodeSchema } from "@citadel/specs/src/projects/auth/schema/totpCodeSchema";
import { ArrowRight, QrCode, ShieldCheck } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

import { checkInput } from "../../../../common/validation/checkInput";
import { authFieldLabels } from "../../api/authFieldLabels";
import { useConfirmTotpFactor } from "../../api/factors/useConfirmTotpFactor";
import { useCreateTotpFactor } from "../../api/factors/useCreateTotpFactor";
import type { TotpSetupFm } from "../../api/model/totpSetupFm.type";
import { useAuthFailure } from "../../hooks/useAuthFailure";
import { CodeInput } from "../CodeInput";
import { FormAlert } from "../FormAlert";
import { FormField } from "../FormField";
import { SubmitButton } from "../SubmitButton";
import { TextField } from "../TextField";
import { TotpQrCode } from "../TotpQrCode";
import styles from "./totpSetupForm.module.scss";

type Props = {
	// Le nom proposé au départ pour reconnaître cette application dans la liste
	defaultName: string;
	// Le TOTP est actif
	onDone: () => void;
	onCancel: () => void;
	// Le bouton de sortie, avant comme après le QR code ; sans lui, « Annuler » puis « Plus tard »
	exitLabel?: string;
};

/**
 * L'ajout d'une application d'authentification : son nom, puis le QR code (dessiné dans ce navigateur) ou la clé à saisir
 * à la main, puis le premier code qu'elle affiche. Rien ne protège le compte tant que ce code n'est pas validé
 */
export function TotpSetupForm({
	defaultName,
	onDone,
	onCancel,
	exitLabel,
}: Props) {
	const fieldId = useId();
	const [name, setName] = useState(defaultName);
	const [code, setCode] = useState("");
	const [setup, setSetup] = useState<TotpSetupFm | null>(null);
	const create = useCreateTotpFactor();
	const confirm = useConfirmTotpFactor();
	const createFailure = useAuthFailure("ajouter cette application");
	const confirmFailure = useAuthFailure("valider ce code");

	const nameCheck = checkInput(
		createTotpFactorBodySchema,
		{ name },
		authFieldLabels,
	);
	const codeCheck = checkInput(totpCodeSchema, code, authFieldLabels);

	function sendName(): void {
		if (!nameCheck.isValid) return;
		createFailure.clear();
		create.mutate(nameCheck.data.name, {
			onSuccess: setSetup,
			onError: (error) => {
				createFailure.report(error, sendName);
			},
		});
	}

	function sendCode(): void {
		if (setup === null || !codeCheck.isValid) return;
		confirmFailure.clear();
		confirm.mutate(
			{ factorId: setup.factorId, code: codeCheck.data },
			{
				onSuccess: onDone,
				onError: (error) => {
					const errorCode = confirmFailure.report(error, sendCode);
					// Le TOTP a été effacé faute de code à temps : il faut en créer un autre
					if (errorCode === AuthErrorCodeEnum.FACTOR_NOT_FOUND) {
						setSetup(null);
						setCode("");
					}
				},
			},
		);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		if (setup === null) sendName();
		else sendCode();
	}

	return (
		<form
			className={styles.form}
			onSubmit={handleSubmit}
			noValidate
		>
			{setup === null ? (
				<>
					<FormField
						label="Nom de l’application"
						htmlFor={`${fieldId}-name`}
						isRequired
					>
						<TextField
							id={`${fieldId}-name`}
							value={name}
							onChange={setName}
							autoComplete="off"
							isRequired
							isInvalid={!nameCheck.isValid}
						/>
						<p className={styles.hint}>
							Pour la reconnaître dans ta liste : « Téléphone », « Bitwarden »…
						</p>
					</FormField>
					{createFailure.failure !== null && (
						<FormAlert
							tone="error"
							onRetry={createFailure.failure.retry}
						>
							{createFailure.failure.message}
						</FormAlert>
					)}
					<SubmitButton
						label="Continuer"
						pendingLabel="Création…"
						icon={<QrCode aria-hidden />}
						isPending={create.isPending}
						waitUntil={createFailure.waitUntil}
						isDisabled={!nameCheck.isValid}
					/>
				</>
			) : (
				<>
					<p className={styles.step}>
						1. Scanne ce QR code avec ton application d’authentification (Google
						Authenticator, Aegis, Bitwarden…).
					</p>
					<div className={styles.qr}>
						<TotpQrCode otpauthUri={setup.otpauthUri} />
					</div>
					<p className={styles.step}>
						Ou saisis cette clé à la main :{" "}
						<code className={styles.secret}>{setup.secret}</code>
					</p>
					<p className={styles.step}>
						2. Saisis le code à 6 chiffres qu’elle affiche.
					</p>
					<FormField
						label="Code de l’application"
						htmlFor={`${fieldId}-code`}
						isRequired
					>
						<CodeInput
							id={`${fieldId}-code`}
							value={code}
							onChange={setCode}
							isInvalid={
								confirmFailure.failure?.code === AuthErrorCodeEnum.INVALID_CODE
							}
						/>
					</FormField>
					{confirmFailure.failure !== null && (
						<FormAlert
							tone="error"
							onRetry={confirmFailure.failure.retry}
						>
							{confirmFailure.failure.message}
						</FormAlert>
					)}
					<SubmitButton
						label="Activer"
						pendingLabel="Vérification…"
						icon={<ShieldCheck aria-hidden />}
						isPending={confirm.isPending}
						waitUntil={confirmFailure.waitUntil}
						isDisabled={!codeCheck.isValid}
					/>
				</>
			)}
			<button
				type="button"
				className={styles.cancel}
				onClick={onCancel}
			>
				{exitLabel ?? (setup === null ? "Annuler" : "Plus tard")}
				<ArrowRight aria-hidden />
			</button>
		</form>
	);
}
