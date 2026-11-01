import { formatFileSize } from "@citadel/common/src/universal/number/formatFileSize";
import { Eraser, HardDrive } from "lucide-react";

import type { StorageStats } from "../../../shared/storageStats.type";
import { usePolling } from "../../api/usePolling";
import { formatAgo } from "../../format/formatAgo";
import { storageTotalBytes } from "../../status/storageTotalBytes";
import { ActionButton } from "../ActionButton";
import { Card } from "../Card";
import { Stat } from "../Stat";
import styles from "./storageCard.module.scss";

type Props = {
	// Une demande est déjà suivie : le bouton attend
	busy: boolean;
	onCleanup: () => void;
};

function sizeOrDash(bytes: number | null): string {
	return bytes === null ? "–" : formatFileSize(bytes);
}

// La place prise par l'infra, relevée chaque heure par infra-ops (storage-stats), et le
// nettoyage de Docker : les images inutiles, jamais celles des retours arrière
export function StorageCard({ busy, onCleanup }: Props) {
	const { data, error, updatedAt } = usePolling<StorageStats>(
		"/storage",
		60_000,
	);

	if (!data?.available)
		return (
			<Card
				title="Stockage"
				icon={HardDrive}
				error={error}
			>
				<p className={styles.muted}>{data ? data.reason : "Lecture…"}</p>
			</Card>
		);

	const { docker } = data;
	return (
		<Card
			title="Stockage"
			icon={HardDrive}
			error={error}
		>
			<div className={styles.total}>
				<span className={styles.totalValue}>
					{formatFileSize(storageTotalBytes(data))}
				</span>
				<span className={styles.muted}>Docker et données des services</span>
			</div>
			<div className={styles.details}>
				<Stat label="Images">{formatFileSize(docker.imagesBytes)}</Stat>
				<Stat label="Conteneurs">{formatFileSize(docker.containersBytes)}</Stat>
				<Stat label="Volumes">{formatFileSize(docker.volumesBytes)}</Stat>
				{docker.buildCacheBytes > 0 ? (
					<Stat label="Cache de build">
						{formatFileSize(docker.buildCacheBytes)}
					</Stat>
				) : null}
				<Stat label="Configs et données (appdata)">
					{sizeOrDash(data.appdataBytes)}
				</Stat>
			</div>
			<div className={styles.details}>
				<Stat label="Base MariaDB du site">
					{sizeOrDash(data.databaseBytes)}
				</Stat>
				<Stat label="Sauvegardes (HDD)">{sizeOrDash(data.backupsBytes)}</Stat>
			</div>
			<div className={styles.cleanup}>
				<span className={styles.muted}>
					{`${formatFileSize(docker.reclaimableBytes)} récupérables · relevé ${formatAgo(data.checkedAt, updatedAt)}`}
				</span>
				<ActionButton
					label="Nettoyer"
					icon={Eraser}
					disabled={busy || docker.reclaimableBytes === 0}
					onClick={onCleanup}
				/>
			</div>
		</Card>
	);
}
