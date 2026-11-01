import { formatFileSize } from "@citadel/common/src/universal/number/formatFileSize";

import type { BackupItem } from "../../shared/backupItem.type";
import { formatDateTime } from "./formatDateTime";
import { parseBackupDate } from "./parseBackupDate";

const KIND_LABELS: Record<BackupItem["kind"], string> = {
	"daily": "de la nuit",
	"pre-deploy": "avant déploiement",
	"pre-restore": "avant restauration",
};

// « dim. 1 nov., 05:00 · de la nuit · 1,2 Mo » ; le nom du fichier s'il n'a pas de date
export function formatBackupLabel(backup: BackupItem): string {
	const date = parseBackupDate(backup.name);
	return `${date ? formatDateTime(date) : backup.name} · ${KIND_LABELS[backup.kind]} · ${formatFileSize(backup.sizeBytes)}`;
}
