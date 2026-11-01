import { RefreshCw, Rocket, Undo2 } from "lucide-react";
import { useState } from "react";

import type { OperationsStatus } from "../../../shared/operationsStatus.type";
import { formatDateTime } from "../../format/formatDateTime";
import { ActionButton } from "../ActionButton";
import { Card } from "../Card";
import type { SendRequest } from "../OperationsSection/sendRequest.type";
import { Stat } from "../Stat";
import styles from "./deployCard.module.scss";

type Props = {
	status: OperationsStatus;
	send: SendRequest;
};

// Déployer une version déjà construite, ou revenir à la précédente, en un clic : après
// le même plan que `citadel deploy` (§14.3). Le plan ne change rien ; « Déployer », dans
// la fenêtre du plan, lance le vrai déploiement.
export function DeployCard({ status, send }: Props) {
	const versions = [...status.publishedVersions].reverse();
	const [chosen, setChosen] = useState<string>("");
	const version = chosen || versions[0] || "";

	function planDeploy(): void {
		send("/operations/deploy-plan", { version }, `Plan : déployer ${version}`, {
			label: `Déployer ${version}`,
			variant: "primary",
			run: () =>
				send("/operations/deploy", { version }, `Déploiement de ${version}`),
		});
	}

	function planRollback(): void {
		const previous = status.previousVersion ?? "";
		send("/operations/rollback-plan", {}, `Plan : revenir à ${previous}`, {
			label: `Revenir à ${previous}`,
			variant: "danger",
			run: () => send("/operations/rollback", {}, `Retour à ${previous}`),
		});
	}

	return (
		<Card
			title="Versions du site"
			icon={Rocket}
		>
			<Stat
				label="En service"
				mono
			>
				{status.currentVersion ?? "aucun déploiement"}
			</Stat>
			<Stat
				label="Précédente"
				mono
			>
				{status.previousVersion ?? "–"}
			</Stat>
			<label className={styles.field}>
				Version à déployer
				<select
					className={styles.input}
					value={version}
					disabled={versions.length === 0}
					onChange={(event) => setChosen(event.target.value)}
				>
					{versions.length === 0 ? (
						<option value="">aucune liste</option>
					) : null}
					{versions.map((item) => (
						<option
							key={item}
							value={item}
						>
							{item === status.currentVersion ? `${item} (en service)` : item}
						</option>
					))}
				</select>
			</label>
			<p className={styles.hint}>
				{status.versionsCheckedAt
					? `Versions publiées sur GHCR, relevées ${formatDateTime(new Date(status.versionsCheckedAt))}`
					: "Versions publiées : pas encore relevées"}
			</p>
			<div className={styles.actions}>
				<ActionButton
					label="Voir le plan"
					icon={Rocket}
					variant="primary"
					disabled={version === ""}
					onClick={planDeploy}
				/>
				<ActionButton
					label={
						status.previousVersion
							? `Revenir à ${status.previousVersion}`
							: "Revenir en arrière"
					}
					icon={Undo2}
					disabled={status.previousVersion === null}
					onClick={planRollback}
				/>
				<ActionButton
					label="Relire les versions"
					icon={RefreshCw}
					onClick={() =>
						send("/jobs/update-check/run", {}, "Relevé des versions publiées")
					}
				/>
			</div>
		</Card>
	);
}
