import { SecondFactorMethodEnum } from "@citadel/specs/src/projects/auth/enum/secondFactorMethod.enum";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum";
import { mailCodeSchema } from "@citadel/specs/src/projects/auth/schema/mailCodeSchema";
import { recoveryCodeSchema } from "@citadel/specs/src/projects/auth/schema/recoveryCodeSchema";
import { totpCodeSchema } from "@citadel/specs/src/projects/auth/schema/totpCodeSchema";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

import { useIsMailSendingOpen } from "../../../../common/api/mail/useIsMailSendingOpen";
import { checkInput } from "../../../../common/validation/checkInput";
import { authFieldLabels } from "../../api/authFieldLabels";
import { useAbandonFlow } from "../../api/flow/useAbandonFlow";
import { useResendFlowMail } from "../../api/flow/useResendFlowMail";
import { useSubmitSecondFactor } from "../../api/flow/useSubmitSecondFactor";
import type { FlowFm } from "../../api/model/flowFm.type";
import { pickLaterTime } from "../../helper/pickLaterTime";
import { pickSecondFactorMethod } from "../../helper/pickSecondFactorMethod";
import { useAuthFailure } from "../../hooks/useAuthFailure";
import { AuthCard } from "../AuthCard";
import { CodeInput } from "../CodeInput";
import { FlowDeadline } from "../FlowDeadline";
import { FormAlert } from "../FormAlert";
import { FormField } from "../FormField";
import { RecoveryCodeInput } from "../RecoveryCodeInput";
import { ResendButton } from "../ResendButton";
import { SecondFactorMethodPicker } from "../SecondFactorMethodPicker";
import { SubmitButton } from "../SubmitButton";
import styles from "./secondFactorStep.module.scss";

type Props = {
	flow: FlowFm;
	// Ce que la vérification permet, après « Il te reste … » : « pour te connecter »
	purpose: string;
};

const CODE_SCHEMAS = {
	[SecondFactorMethodEnum.TOTP]: totpCodeSchema,
	[SecondFactorMethodEnum.EMAIL]: mailCodeSchema,
	[SecondFactorMethodEnum.RECOVERY_CODE]: recoveryCodeSchema,
};

const FIELD_LABELS: Record<SecondFactorMethodEnum, string> = {
	[SecondFactorMethodEnum.TOTP]: "Code de l’application",
	[SecondFactorMethodEnum.EMAIL]: "Code reçu par email",
	[SecondFactorMethodEnum.RECOVERY_CODE]: "Code de secours",
};

const HINTS: Record<SecondFactorMethodEnum, string> = {
	[SecondFactorMethodEnum.TOTP]:
		"Ouvre ton application d’authentification (Google Authenticator, Aegis, Bitwarden…) et saisis les 6 chiffres affichés pour Citadel.",
	[SecondFactorMethodEnum.EMAIL]:
		"Le code part à l’adresse email de ton compte. Rien reçu ? Regarde dans les indésirables, l’email peut mettre une minute à arriver.",
	[SecondFactorMethodEnum.RECOVERY_CODE]:
		"Un des codes sauvegardés à l’activation de la double authentification. Chacun ne sert qu’une fois.",
};

/**
 * L'étape « second facteur » d'une connexion ou d'un mot de passe oublié : le code de l'application, un code reçu par
 * email (connexion par mot de passe seulement) ou un code de secours. Le code par email est grisé quand plus aucun
 * email ne part aujourd'hui ; chaque échec impose le délai de la connexion, bouton compris
 */
export function SecondFactorStep({ flow, purpose }: Props) {
	const fieldId = useId();
	const isMailOpen = useIsMailSendingOpen();
	const [chosenMethod, setChosenMethod] =
		useState<SecondFactorMethodEnum | null>(null);
	const [code, setCode] = useState("");
	const [hasSentMail, setHasSentMail] = useState(false);
	const submit = useSubmitSecondFactor();
	const sendMail = useResendFlowMail();
	const abandon = useAbandonFlow();
	const codeFailure = useAuthFailure("valider le code");
	const mailFailure = useAuthFailure("envoyer l’email");

	const method = pickSecondFactorMethod({
		offered: flow.secondFactorMethods,
		chosen: chosenMethod,
		isMailOpen,
	});
	if (method === null)
		return (
			<AuthCard
				icon={<ShieldCheck />}
				title="Double authentification"
			>
				<div className={styles.form}>
					<FormAlert tone="error">
						Ton compte n’a plus aucun moyen de terminer cette étape : recommence
						depuis le début.
					</FormAlert>
					<button
						type="button"
						className={styles.restart}
						onClick={() => abandon.mutate()}
						disabled={abandon.isPending}
					>
						Recommencer
					</button>
				</div>
			</AuthCard>
		);

	const codeCheck = checkInput(CODE_SCHEMAS[method], code, authFieldLabels);
	const isEmail = method === SecondFactorMethodEnum.EMAIL;
	const isMailExhausted = isEmail && flow.remainingAttempts === 0;

	function chooseMethod(nextMethod: SecondFactorMethodEnum): void {
		setChosenMethod(nextMethod);
		setCode("");
		codeFailure.clear();
	}

	function send(): void {
		if (method === null || !codeCheck.isValid) return;
		codeFailure.clear();
		submit.mutate(
			{ method, code: codeCheck.data },
			{
				onError: (error) => {
					codeFailure.report(error, send);
				},
			},
		);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		send();
	}

	function handleSendMail(): void {
		mailFailure.clear();
		sendMail.mutate(undefined, {
			onSuccess: () => {
				setCode("");
				setHasSentMail(true);
				codeFailure.clear();
			},
			onError: (error) => {
				mailFailure.report(error, handleSendMail);
			},
		});
	}

	return (
		<AuthCard
			icon={<ShieldCheck />}
			title="Double authentification"
			lead={`Ton compte est protégé : une dernière vérification ${purpose}.`}
		>
			<form
				className={styles.form}
				onSubmit={handleSubmit}
				noValidate
			>
				{flow.secondFactorMethods.length > 1 && (
					<SecondFactorMethodPicker
						methods={flow.secondFactorMethods}
						value={method}
						onChange={chooseMethod}
						disabledMethods={isMailOpen ? [] : [SecondFactorMethodEnum.EMAIL]}
					/>
				)}
				{isEmail && !isMailOpen && (
					<FormAlert tone="info">
						Plus aucun email ne part aujourd’hui : utilise ton application ou un
						code de secours.
					</FormAlert>
				)}
				{isEmail && (
					<div className={styles.mailRequest}>
						<ResendButton
							label={
								hasSentMail || flow.resendAvailableAt !== null
									? "Renvoyer l’email"
									: "Recevoir un code par email"
							}
							// Un 429 ou un 503 de l'envoi impose son attente, même avant le délai entre deux mails
							availableAt={pickLaterTime(
								flow.resendAvailableAt,
								mailFailure.waitUntil,
							)}
							isPending={sendMail.isPending}
							isDisabled={!isMailOpen}
							onResend={handleSendMail}
						/>
					</div>
				)}
				{isEmail && hasSentMail && mailFailure.failure === null && (
					<FormAlert tone="info">
						Un email est parti : seul son dernier code est valable.
					</FormAlert>
				)}
				{isEmail && mailFailure.failure !== null && (
					<FormAlert
						tone="error"
						onRetry={mailFailure.failure.retry}
					>
						{mailFailure.failure.message}
					</FormAlert>
				)}
				<FormField
					label={FIELD_LABELS[method]}
					htmlFor={`${fieldId}-code`}
					isRequired
				>
					{method === SecondFactorMethodEnum.RECOVERY_CODE ? (
						<RecoveryCodeInput
							id={`${fieldId}-code`}
							value={code}
							onChange={setCode}
							isInvalid={
								codeFailure.failure?.code === AuthErrorCodeEnum.INVALID_CODE
							}
						/>
					) : (
						<CodeInput
							id={`${fieldId}-code`}
							value={code}
							onChange={setCode}
							isDisabled={isMailExhausted}
							isInvalid={
								codeFailure.failure?.code === AuthErrorCodeEnum.INVALID_CODE
							}
						/>
					)}
					<p className={styles.hint}>{HINTS[method]}</p>
				</FormField>
				{isMailExhausted && (
					<FormAlert tone="error">
						Tous les essais de ce code sont faits : demande un nouvel email.
					</FormAlert>
				)}
				{!isMailExhausted && codeFailure.failure !== null && (
					<FormAlert
						tone="error"
						onRetry={codeFailure.failure.retry}
					>
						{codeFailure.failure.message}
					</FormAlert>
				)}
				<SubmitButton
					label="Valider"
					pendingLabel="Vérification…"
					icon={<ArrowRight aria-hidden />}
					isPending={submit.isPending}
					waitUntil={codeFailure.waitUntil}
					isDisabled={!codeCheck.isValid || isMailExhausted}
				/>
				<FlowDeadline
					expiresAt={flow.expiresAt}
					purpose={purpose}
					onRestart={() => abandon.mutate()}
				/>
				<button
					type="button"
					className={styles.restart}
					onClick={() => abandon.mutate()}
					disabled={abandon.isPending}
				>
					Recommencer
				</button>
			</form>
		</AuthCard>
	);
}
