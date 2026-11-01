import { DatabaseBackup, Upload } from "lucide-react";
import { useState } from "react";

import type { OperationsStatus } from "../../../shared/operationsStatus.type";
import { uploadDump } from "../../api/uploadDump";
import { formatBackupLabel } from "../../format/formatBackupLabel";
import { BACKUP_LOCATION_LABELS } from "../../status/backupLocationLabels";
import { ActionButton } from "../ActionButton";
import { Card } from "../Card";
import type { SendRequest } from "../OperationsSection/sendRequest.type";
import styles from "./restoreCard.module.scss";

type Props = {
	status: OperationsStatus;
	send: SendRequest;
	onError: (message: string) => void;
};

const CONFIRMATION = "RESTAURER";
const UPLOAD_CHOICE = "upload";
// La zone de danger (§11.8) : remettre la base du site d'une sauvegarde du NAS ou du
// Drive (téléchargée d'abord), ou en secours d'un dump envoyé depuis ton PC. infra-ops dumpe d'abord la base actuelle,
// puis affiche le bandeau « restauré » pendant 3 mois.
export function RestoreCard({ status, send, onError }: Props) {
	const [source, setSource] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [typed, setTyped] = useState("");
	const [uploading, setUploading] = useState(false);
	const chosen = source || status.backups[0]?.path || UPLOAD_CHOICE;
	const ready =
		typed === CONFIRMATION && (chosen !== UPLOAD_CHOICE || file !== null);

	async function restore(): Promise<void> {
		let restoreSource = chosen;
		if (chosen === UPLOAD_CHOICE && file) {
			setUploading(true);
			try {
				restoreSource = await uploadDump(file);
			} catch (uploadError) {
				onError(
					uploadError instanceof Error
						? uploadError.message
						: String(uploadError),
				);
				return;
			} finally {
				setUploading(false);
			}
		}
		send(
			"/operations/restore",
			{ source: restoreSource, confirmation: CONFIRMATION },
			"Restauration de la base du site",
		);
		setTyped("");
	}

	return (
		<Card
			title="Restaurer la base"
			icon={DatabaseBackup}
			status={{ tone: "danger", text: "Zone de danger" }}
			tone="danger"
		>
			<p className={styles.warning}>
				{
					"Tout ce qui a été écrit dans la base depuis la sauvegarde choisie sera perdu. La base actuelle est d'abord sauvegardée (« avant restauration »)."
				}
			</p>
			<label className={styles.field}>
				Sauvegarde
				<select
					className={styles.input}
					value={chosen}
					onChange={(event) => setSource(event.target.value)}
				>
					{status.backups.map((backup) => (
						<option
							key={backup.path}
							value={backup.path}
						>
							{`(${BACKUP_LOCATION_LABELS[backup.location]}) ${formatBackupLabel(backup)}`}
						</option>
					))}
					<option value={UPLOAD_CHOICE}>Un dump envoyé depuis ce PC…</option>
				</select>
			</label>
			{chosen === UPLOAD_CHOICE ? (
				<label className={styles.field}>
					<span>
						<Upload
							size={13}
							aria-hidden
						/>
						{" Dump .sql.zst (comme ceux du NAS)"}
					</span>
					<input
						className={styles.input}
						type="file"
						accept=".zst"
						onChange={(event) => setFile(event.target.files?.[0] ?? null)}
					/>
				</label>
			) : null}
			<label className={styles.field}>
				{`Pour confirmer, tape ${CONFIRMATION}`}
				<input
					className={styles.input}
					type="text"
					autoComplete="off"
					spellCheck={false}
					value={typed}
					onChange={(event) => setTyped(event.target.value)}
				/>
			</label>
			<div className={styles.actions}>
				<ActionButton
					label={uploading ? "Envoi du dump…" : "Restaurer la base"}
					icon={DatabaseBackup}
					variant="danger"
					disabled={!ready || uploading}
					onClick={() => {
						void restore();
					}}
				/>
			</div>
		</Card>
	);
}
