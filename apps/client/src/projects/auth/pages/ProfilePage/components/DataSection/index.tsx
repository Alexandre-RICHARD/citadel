import { FactorTypeEnum } from "@citadel/specs/src/projects/auth/enum/factorType.enum";
import { AuthErrorCodeEnum } from "@citadel/specs/src/projects/auth/error/authErrorCode.enum";
import { Database, Download, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { useNavigate } from "react-router";

import { ApiError } from "../../../../../../common/api/error/ApiError";
import { ProjectsEnum } from "../../../../../../react/appNavigation/projects.enum";
import { projects } from "../../../../../../react/appNavigation/projectsDictionary";
import { useFactors } from "../../../../api/factors/useFactors";
import { useDeleteAccount } from "../../../../api/me/useDeleteAccount";
import { FormAlert } from "../../../../components/FormAlert";
import { FormField } from "../../../../components/FormField";
import { PasswordConfirmForm } from "../../../../components/PasswordConfirmForm";
import { ProfileSection } from "../../../../components/ProfileSection";
import { TextField } from "../../../../components/TextField";
import { readSecondFactorAnswer } from "../../../../helper/secondFactor/readSecondFactorAnswer";
import styles from "./dataSection.module.scss";

// Un simple lien : le navigateur le télécharge avec le cookie de session, sans passer par une requête de la page
const EXPORT_URL = "/api/auth/me/export";

// Mes données : le téléchargement de tout ce que le site garde sur le compte, et la suppression du compte, immédiate et
// définitive. Avec une application d'authentification, un de ses codes (ou un code de secours) est demandé en plus du mot
// de passe
export function DataSection() {
	const fieldId = useId();
	const navigate = useNavigate();
	const { factors } = useFactors();
	const deleteAccount = useDeleteAccount();
	const [isDeleting, setIsDeleting] = useState(false);
	const [typedCode, setTypedCode] = useState("");
	// Aussi vrai quand le serveur l'a exigé : la liste des facteurs a pu ne pas être lue
	const [isCodeDemanded, setIsCodeDemanded] = useState(false);
	const hasTotp =
		isCodeDemanded ||
		(factors?.factors.some((factor) => factor.type === FactorTypeEnum.TOTP) ??
			false);
	const answer = readSecondFactorAnswer(typedCode);

	function close(): void {
		setIsDeleting(false);
		setTypedCode("");
	}

	return (
		<ProfileSection
			icon={<Database />}
			title="Mes données"
			lead="Tout ce que le site garde sur ton compte t’appartient."
		>
			<div className={styles.export}>
				<a
					className={styles.download}
					href={EXPORT_URL}
				>
					<Download aria-hidden />
					Télécharger mes données
				</a>
				<p className={styles.hint}>
					Un fichier ZIP avec un CSV par table, sans aucun secret (ni mot de
					passe, ni clé de double authentification).
				</p>
			</div>

			<div className={styles.danger}>
				<h3 className={styles.dangerTitle}>Supprimer mon compte</h3>
				{isDeleting ? (
					<>
						<FormAlert tone="error">
							La suppression est immédiate et définitive. Aucun délai de
							récupération : ton compte et toutes tes données disparaissent, et
							un email te le confirme.
						</FormAlert>
						<PasswordConfirmForm
							actionLabel="supprimer ton compte"
							confirmLabel="Supprimer définitivement mon compte"
							pendingLabel="Suppression…"
							icon={<Trash2 aria-hidden />}
							isDanger
							isPending={deleteAccount.isPending}
							isDisabled={hasTotp && answer === null}
							onConfirm={(password, options) =>
								deleteAccount.mutate(
									{
										password,
										...(hasTotp && answer !== null && { secondFactor: answer }),
									},
									{
										onSuccess: options.onSuccess,
										onError: (error) => {
											options.onError(error);
											if (
												error instanceof ApiError &&
												error.code === AuthErrorCodeEnum.SECOND_FACTOR_REQUIRED
											)
												setIsCodeDemanded(true);
										},
									},
								)
							}
							onDone={() => {
								void navigate(projects[ProjectsEnum.Homepage].path);
							}}
							onCancel={close}
						>
							{hasTotp && (
								<FormField
									label="Code de ton application, ou code de secours"
									htmlFor={`${fieldId}-code`}
									isRequired
								>
									<TextField
										id={`${fieldId}-code`}
										value={typedCode}
										onChange={setTypedCode}
										autoComplete="one-time-code"
										maxLength={16}
										isRequired
									/>
								</FormField>
							)}
						</PasswordConfirmForm>
					</>
				) : (
					<button
						type="button"
						className={styles.delete}
						onClick={() => setIsDeleting(true)}
					>
						<Trash2 aria-hidden />
						Supprimer mon compte
					</button>
				)}
			</div>
		</ProfileSection>
	);
}
