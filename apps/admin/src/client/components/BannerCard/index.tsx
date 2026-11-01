import { ConfirmDialog } from "@citadel/design-system/src/molecules/ConfirmDialog";
import { Construction, Megaphone, X } from "lucide-react";
import { useState } from "react";

import type { OperationsStatus } from "../../../shared/operationsStatus.type";
import { formatDateTime } from "../../format/formatDateTime";
import { ActionButton } from "../ActionButton";
import { Card } from "../Card";
import type { QuickRequest } from "../OperationsSection/quickRequest.type";
import styles from "./bannerCard.module.scss";

type Props = {
	status: OperationsStatus;
	quick: QuickRequest;
};

const MESSAGE_LIMIT = 500;

// Le bandeau du site (§11.8) et son mode maintenance (§14.3) : deux fichiers qu'infra-ops
// écrit, que Caddy sert ou regarde. Ils marchent même si l'API est en panne.
export function BannerCard({ status, quick }: Props) {
	const [message, setMessage] = useState("");
	const [endsAt, setEndsAt] = useState("");
	const [confirmMaintenance, setConfirmMaintenance] = useState(false);
	const { banner, maintenance } = status;

	return (
		<Card
			title="Bandeau et maintenance"
			icon={Megaphone}
			status={
				maintenance ? { tone: "warn", text: "Site en maintenance" } : undefined
			}
		>
			<div className={styles.current}>
				<p className={styles.label}>Bandeau affiché</p>
				{banner ? (
					<>
						<p className={styles.banner}>{banner.message}</p>
						<p className={styles.hint}>
							{banner.endsAt
								? `jusqu'au ${formatDateTime(new Date(banner.endsAt))}`
								: "jusqu'à ce que tu le retires"}
						</p>
						<ActionButton
							label="Retirer le bandeau"
							icon={X}
							onClick={() =>
								quick("/operations/banner/clear", {}, "Bandeau retiré")
							}
						/>
					</>
				) : (
					<p className={styles.hint}>aucun</p>
				)}
			</div>

			<label className={styles.field}>
				{`Nouveau message (${message.length}/${MESSAGE_LIMIT})`}
				<textarea
					className={styles.input}
					rows={3}
					maxLength={MESSAGE_LIMIT}
					placeholder="Les inscriptions sont fermées : tu peux encore te connecter si tu as un compte"
					value={message}
					onChange={(event) => setMessage(event.target.value)}
				/>
			</label>
			<label className={styles.field}>
				Dernier jour affiché (facultatif)
				<input
					className={styles.input}
					type="date"
					value={endsAt}
					onChange={(event) => setEndsAt(event.target.value)}
				/>
			</label>
			<div className={styles.actions}>
				<ActionButton
					label={banner ? "Remplacer le bandeau" : "Publier le bandeau"}
					icon={Megaphone}
					variant="primary"
					disabled={message.trim() === ""}
					onClick={() => {
						quick("/operations/banner", { message, endsAt }, "Bandeau publié");
						setMessage("");
						setEndsAt("");
					}}
				/>
				<ActionButton
					label={
						maintenance
							? "Quitter le mode maintenance"
							: "Activer le mode maintenance"
					}
					icon={Construction}
					variant={maintenance ? "ghost" : "danger"}
					onClick={() => {
						if (maintenance)
							quick(
								"/operations/maintenance",
								{ enabled: false },
								"Le site est de nouveau ouvert",
							);
						else setConfirmMaintenance(true);
					}}
				/>
			</div>

			<ConfirmDialog
				open={confirmMaintenance}
				title="Activer le mode maintenance ?"
				description={
					<p>
						{
							"Tout le site affiche sa page de maintenance (erreur 503), API comprise, jusqu'à ce que tu le désactives. Jellyfin n'est pas concerné."
						}
					</p>
				}
				confirmLabel="Activer"
				destructive
				onConfirm={() => {
					setConfirmMaintenance(false);
					quick(
						"/operations/maintenance",
						{ enabled: true },
						"Le site est en maintenance",
					);
				}}
				onCancel={() => setConfirmMaintenance(false)}
			/>
		</Card>
	);
}
