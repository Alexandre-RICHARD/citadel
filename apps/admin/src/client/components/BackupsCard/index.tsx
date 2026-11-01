import { IconButton } from "@citadel/design-system/src/atoms/IconButton";
import { ConfirmDialog } from "@citadel/design-system/src/molecules/ConfirmDialog";
import { Archive, X } from "lucide-react";
import { useState } from "react";

import type { BackupItem } from "../../../shared/backupItem.type";
import type { OperationsStatus } from "../../../shared/operationsStatus.type";
import { formatBackupLabel } from "../../format/formatBackupLabel";
import { BACKUP_LOCATION_LABELS } from "../../status/backupLocationLabels";
import { Card } from "../Card";
import type { SendRequest } from "../OperationsSection/sendRequest.type";
import styles from "./backupsCard.module.scss";

type Props = {
	status: OperationsStatus;
	send: SendRequest;
};

const LOCATIONS: BackupItem["location"][] = ["nas", "drive"];

// Les dumps de la base, sur le HDD du NAS et sur le Drive : une croix pour en supprimer un.
// La rétention d'infra-ops fait déjà le ménage seule ; ici, c'est à la main.
export function BackupsCard({ status, send }: Props) {
	const [toDelete, setToDelete] = useState<BackupItem | null>(null);

	return (
		<Card
			title="Sauvegardes de la base"
			icon={Archive}
		>
			{LOCATIONS.map((location) => {
				const items = status.backups.filter(
					(backup) => backup.location === location,
				);
				const unreachable =
					location === "drive" ? status.backupsDriveError : null;
				return (
					<div
						key={location}
						className={styles.group}
					>
						<p className={styles.groupTitle}>
							{`${BACKUP_LOCATION_LABELS[location]} · ${items.length}`}
						</p>
						{unreachable ? <p className={styles.error}>{unreachable}</p> : null}
						{items.length === 0 && !unreachable ? (
							<p className={styles.hint}>aucune</p>
						) : null}
						{items.length > 0 ? (
							<ul className={styles.list}>
								{items.map((backup) => (
									<li
										key={backup.path}
										className={styles.item}
									>
										<span className={styles.label}>
											{formatBackupLabel(backup)}
										</span>
										<IconButton
											icon={X}
											label={`Supprimer ${backup.name}`}
											variant="destructive"
											size="sm"
											onClick={() => setToDelete(backup)}
										/>
									</li>
								))}
							</ul>
						) : null}
					</div>
				);
			})}
			<p className={styles.hint}>
				{
					"Un dump retiré du Drive mais encore sur le NAS y repart à la sauvegarde suivante."
				}
			</p>

			<ConfirmDialog
				open={toDelete !== null}
				title={`Supprimer ce dump du ${toDelete ? BACKUP_LOCATION_LABELS[toDelete.location] : ""} ?`}
				description={toDelete ? formatBackupLabel(toDelete) : undefined}
				confirmLabel="Supprimer"
				destructive
				onConfirm={() => {
					if (toDelete)
						send(
							"/operations/backup-delete",
							{ source: toDelete.path },
							`Suppression d'un dump (${BACKUP_LOCATION_LABELS[toDelete.location]})`,
						);
					setToDelete(null);
				}}
				onCancel={() => setToDelete(null)}
			/>
		</Card>
	);
}
