import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum";
import { mailCodeSchema } from "@citadel/specs/src/projects/auth/schema/mailCodeSchema";
import { usernameSchema } from "@citadel/specs/src/projects/auth/schema/usernameSchema";
import { ArrowRight, MailCheck } from "lucide-react";
import { type FormEvent, type ReactNode, useId, useState } from "react";

import { checkInput } from "../../../../common/validation/checkInput";
import { authFieldLabels } from "../../api/authFieldLabels";
import { useAbandonFlow } from "../../api/flow/useAbandonFlow";
import { useResendFlowMail } from "../../api/flow/useResendFlowMail";
import { useSubmitFlowCode } from "../../api/flow/useSubmitFlowCode";
import type { FlowFm } from "../../api/model/flowFm.type";
import { pickLaterTime } from "../../helper/pickLaterTime";
import { useAuthFailure } from "../../hooks/useAuthFailure";
import { AuthCard } from "../AuthCard";
import { CodeInput } from "../CodeInput";
import { FlowDeadline } from "../FlowDeadline";
import { FormAlert } from "../FormAlert";
import { FormField } from "../FormField";
import { ResendButton } from "../ResendButton";
import { SubmitButton } from "../SubmitButton";
import { TextField } from "../TextField";
import styles from "./mailCodeStep.module.scss";

type Props = {
	flow: FlowFm;
	title: string;
	// Où le mail est parti. Une réponse neutre (connexion par email, mot de passe oublié) ne dit jamais si un compte
	// existe : « si un compte correspond, un email est parti à son adresse »
	lead: ReactNode;
	// Ce que le code permet, après « Il vous reste … » : « pour confirmer votre inscription »
	purpose: string;
	// Inscription seulement : le pseudo choisi a pu être pris entre-temps, la page en redemande un
	canReplaceUsername?: boolean;
};

/**
 * L'étape « lien ou code », commune à tous les parcours : le lien du mail ne marche que dans ce navigateur, le code se
 * tape ici, que l'email soit lu sur le téléphone ou ailleurs. Renvoi après le délai, temps restant, « Recommencer »
 */
export function MailCodeStep({
	flow,
	title,
	lead,
	purpose,
	canReplaceUsername = false,
}: Props) {
	const fieldId = useId();
	const [code, setCode] = useState("");
	// null tant que le pseudo choisi n'a pas été pris entre-temps
	const [replacingUsername, setReplacingUsername] = useState<string | null>(
		null,
	);
	const [hasResent, setHasResent] = useState(false);
	const submitCode = useSubmitFlowCode();
	const resend = useResendFlowMail();
	const abandon = useAbandonFlow();
	const codeFailure = useAuthFailure("valider le code");
	const resendFailure = useAuthFailure("renvoyer l’email");

	const codeCheck = checkInput(mailCodeSchema, code, authFieldLabels);
	const usernameCheck =
		replacingUsername === null
			? null
			: checkInput(usernameSchema, replacingUsername, authFieldLabels);
	const isExhausted = flow.remainingAttempts === 0;

	function send(): void {
		if (!codeCheck.isValid || usernameCheck?.isValid === false) return;
		codeFailure.clear();
		submitCode.mutate(
			{
				code: codeCheck.data,
				...(usernameCheck?.isValid === true && {
					username: usernameCheck.data,
				}),
			},
			{
				onError: (error) => {
					const errorCode = codeFailure.report(error, send);
					if (
						canReplaceUsername &&
						errorCode === AuthErrorCodeEnum.USERNAME_TAKEN
					)
						setReplacingUsername((current) => current ?? "");
				},
			},
		);
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();
		send();
	}

	function handleResend(): void {
		resendFailure.clear();
		resend.mutate(undefined, {
			onSuccess: () => {
				setCode("");
				setHasResent(true);
				codeFailure.clear();
			},
			onError: (error) => {
				resendFailure.report(error, handleResend);
			},
		});
	}

	return (
		<AuthCard
			icon={<MailCheck />}
			title={title}
			lead={
				<>
					{lead} Cliquez sur son lien, dans ce navigateur, ou saisissez ici le
					code qu’il contient.
				</>
			}
		>
			<form
				className={styles.form}
				onSubmit={handleSubmit}
				noValidate
			>
				{replacingUsername !== null && (
					<FormField
						label="Nouveau pseudo"
						htmlFor={`${fieldId}-username`}
						isRequired
					>
						<TextField
							id={`${fieldId}-username`}
							value={replacingUsername}
							onChange={setReplacingUsername}
							autoComplete="username"
							isRequired
							isInvalid={usernameCheck?.isValid === false}
						/>
						<p className={styles.hint}>
							Le pseudo choisi a été pris entre-temps : choisissez-en un autre,
							votre code reste valable.
						</p>
					</FormField>
				)}
				<FormField
					label="Code reçu par email"
					htmlFor={`${fieldId}-code`}
					isRequired
				>
					<CodeInput
						id={`${fieldId}-code`}
						value={code}
						onChange={setCode}
						isDisabled={isExhausted}
						isInvalid={
							codeFailure.failure?.code === AuthErrorCodeEnum.INVALID_CODE
						}
					/>
				</FormField>
				{isExhausted && (
					<FormAlert tone="error">
						Tous les essais de ce code sont faits : demande un nouvel email.
					</FormAlert>
				)}
				{!isExhausted && codeFailure.failure !== null && (
					<FormAlert
						tone="error"
						onRetry={codeFailure.failure.retry}
					>
						{codeFailure.failure.message}
					</FormAlert>
				)}
				{hasResent && resendFailure.failure === null && (
					<FormAlert tone="info">
						Un nouvel email est parti : seul son code est valable maintenant.
					</FormAlert>
				)}
				{resendFailure.failure !== null && (
					<FormAlert
						tone="error"
						onRetry={resendFailure.failure.retry}
					>
						{resendFailure.failure.message}
					</FormAlert>
				)}
				<SubmitButton
					label="Valider le code"
					pendingLabel="Vérification…"
					icon={<ArrowRight aria-hidden />}
					isPending={submitCode.isPending}
					waitUntil={codeFailure.waitUntil}
					isDisabled={
						!codeCheck.isValid ||
						isExhausted ||
						usernameCheck?.isValid === false
					}
				/>
				<FlowDeadline
					expiresAt={flow.expiresAt}
					purpose={purpose}
					onRestart={() => abandon.mutate()}
				/>
				<div className={styles.secondaryActions}>
					<ResendButton
						// Un 429 ou un 503 du renvoi impose son attente, même avant le délai entre deux mails
						availableAt={pickLaterTime(
							flow.resendAvailableAt,
							resendFailure.waitUntil,
						)}
						isPending={resend.isPending}
						onResend={handleResend}
					/>
					<button
						type="button"
						className={styles.restart}
						onClick={() => abandon.mutate()}
						disabled={abandon.isPending}
					>
						Recommencer
					</button>
				</div>
				<p className={styles.hint}>
					Rien reçu ? Regardez dans les indésirables. L’email peut mettre une
					minute à arriver.
				</p>
			</form>
		</AuthCard>
	);
}
