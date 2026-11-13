import { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum";
import { KeyRound, Mail, RefreshCw, Smartphone, Trash2 } from "lucide-react";
import { useState } from "react";

import { useIsMailSendingOpen } from "../../../../../../common/api/mail/useIsMailSendingOpen";
import { useDeleteFactor } from "../../../../api/factors/useDeleteFactor";
import { useFactors } from "../../../../api/factors/useFactors";
import { useRegenerateRecoveryCodes } from "../../../../api/factors/useRegenerateRecoveryCodes";
import { useStartEmailFactor } from "../../../../api/factors/useStartEmailFactor";
import type { FactorFm } from "../../../../api/model/factorFm.type";
import { FormAlert } from "../../../../components/FormAlert";
import { PasswordConfirmForm } from "../../../../components/PasswordConfirmForm";
import { TotpSetupForm } from "../../../../components/TotpSetupForm";
import { useAuthFailure } from "../../../../hooks/useAuthFailure";
import { ProfileSubsection } from "../ProfileSubsection";
import styles from "./secondFactorSection.module.scss";

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

const FACTOR_TYPE_LABELS: Record<FactorTypeEnum, string> = {
	[FactorTypeEnum.TOTP]: "Application d’authentification",
	[FactorTypeEnum.EMAIL]: "Code par email",
};

type Action =
	| { kind: "none" }
	| { kind: "addTotp" }
	| { kind: "removeFactor"; factorId: number }
	| { kind: "regenerateCodes" };

function describeFactor({ createdAt, lastUsedAt }: FactorFm): string {
	const created = `Ajouté le ${DATE_FORMAT.format(createdAt)}`;
	return lastUsedAt === null
		? `${created} · jamais utilisé`
		: `${created} · utilisé le ${DATE_FORMAT.format(lastUsedAt)}`;
}

// La double authentification : ses facteurs (application, code par email), leur ajout et leur retrait, et les codes de
// secours. Chaque retrait et chaque nouveau lot de codes redemande le mot de passe
export function SecondFactorSection() {
	const { factors, isError, retry } = useFactors();
	const isMailOpen = useIsMailSendingOpen();
	const [action, setAction] = useState<Action>({ kind: "none" });
	const startEmailFactor = useStartEmailFactor();
	const deleteFactor = useDeleteFactor();
	const regenerate = useRegenerateRecoveryCodes();
	const emailFailure = useAuthFailure("activer le code par email");

	function close(): void {
		setAction({ kind: "none" });
	}

	function activateEmailFactor(): void {
		emailFailure.clear();
		startEmailFactor.mutate(undefined, {
			onError: (error) => {
				emailFailure.report(error, activateEmailFactor);
			},
		});
	}

	if (isError)
		return (
			<ProfileSubsection title="Double authentification">
				<FormAlert
					tone="error"
					onRetry={() => {
						void retry();
					}}
				>
					Impossible de lire ta double authentification.
				</FormAlert>
			</ProfileSubsection>
		);
	if (factors === undefined)
		return (
			<ProfileSubsection title="Double authentification">
				<p
					className={styles.empty}
					role="status"
				>
					Chargement…
				</p>
			</ProfileSubsection>
		);

	const hasEmailFactor = factors.factors.some(
		(factor) => factor.type === FactorTypeEnum.EMAIL,
	);
	const hasFactor = factors.factors.length > 0;

	return (
		<ProfileSubsection
			title="Double authentification"
			lead="Un second code, en plus du mot de passe, protège ton compte si celui-ci fuite."
		>
			{hasFactor ? (
				<ul className={styles.factors}>
					{factors.factors.map((factor) => (
						<li
							key={factor.id}
							className={styles.factor}
						>
							<span
								className={styles.factorIcon}
								aria-hidden
							>
								{factor.type === FactorTypeEnum.TOTP ? (
									<Smartphone />
								) : (
									<Mail />
								)}
							</span>
							<div className={styles.factorText}>
								<strong>{factor.name}</strong>
								<span>{FACTOR_TYPE_LABELS[factor.type]}</span>
								<span>{describeFactor(factor)}</span>
							</div>
							<button
								type="button"
								className={styles.remove}
								onClick={() =>
									setAction({ kind: "removeFactor", factorId: factor.id })
								}
								aria-label={`Retirer ${factor.name}`}
								title="Retirer"
							>
								<Trash2 aria-hidden />
							</button>
							{action.kind === "removeFactor" &&
								action.factorId === factor.id && (
									<div className={styles.confirm}>
										<PasswordConfirmForm
											actionLabel="retirer cette double authentification"
											confirmLabel="Retirer"
											pendingLabel="Retrait…"
											icon={<Trash2 aria-hidden />}
											isDanger
											isPending={deleteFactor.isPending}
											onConfirm={(password, options) =>
												deleteFactor.mutate(
													{ factorId: factor.id, password },
													options,
												)
											}
											onDone={close}
											onCancel={close}
										/>
									</div>
								)}
						</li>
					))}
				</ul>
			) : (
				<p className={styles.empty}>
					Aucune double authentification : ton compte n’est protégé que par son
					mot de passe.
				</p>
			)}

			{action.kind === "addTotp" ? (
				<TotpSetupForm
					defaultName="Mon application"
					onDone={close}
					onCancel={close}
				/>
			) : (
				<div className={styles.adders}>
					<button
						type="button"
						className={styles.add}
						onClick={() => setAction({ kind: "addTotp" })}
					>
						<Smartphone aria-hidden />
						Ajouter une application
					</button>
					{!hasEmailFactor && (
						<button
							type="button"
							className={styles.add}
							onClick={activateEmailFactor}
							disabled={!isMailOpen || startEmailFactor.isPending}
						>
							<Mail aria-hidden />
							Activer le code par email
						</button>
					)}
				</div>
			)}
			{!hasEmailFactor && !isMailOpen && (
				<p className={styles.empty}>
					Plus aucun email ne part aujourd’hui : le code par email pourra être
					activé demain.
				</p>
			)}
			{emailFailure.failure !== null && (
				<FormAlert
					tone="error"
					onRetry={emailFailure.failure.retry}
				>
					{emailFailure.failure.message}
				</FormAlert>
			)}

			{hasFactor && (
				<div className={styles.recovery}>
					<div>
						<strong>Codes de secours</strong>
						<p className={styles.empty}>
							{factors.remainingRecoveryCodes === 0
								? "Aucun code de secours utilisable : refais-en."
								: `${factors.remainingRecoveryCodes} code${factors.remainingRecoveryCodes > 1 ? "s" : ""} de secours utilisable${factors.remainingRecoveryCodes > 1 ? "s" : ""}.`}
						</p>
					</div>
					{action.kind === "regenerateCodes" ? (
						<PasswordConfirmForm
							actionLabel="refaire tes codes de secours"
							confirmLabel="Refaire mes codes"
							pendingLabel="Création…"
							icon={<KeyRound aria-hidden />}
							isPending={regenerate.isPending}
							onConfirm={(password, options) =>
								regenerate.mutate(password, options)
							}
							onDone={close}
							onCancel={close}
						>
							<FormAlert tone="info">
								Les anciens codes, utilisés ou non, ne marcheront plus.
							</FormAlert>
						</PasswordConfirmForm>
					) : (
						<button
							type="button"
							className={styles.add}
							onClick={() => setAction({ kind: "regenerateCodes" })}
						>
							<RefreshCw aria-hidden />
							Refaire mes codes de secours
						</button>
					)}
				</div>
			)}
		</ProfileSubsection>
	);
}
