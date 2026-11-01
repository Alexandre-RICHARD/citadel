import type { BackupItem } from "../../shared/backupItem.type";

// Où est un dump de la base : préfixe des choix de « Restaurer la base », titres des
// groupes de « Sauvegardes de la base »
export const BACKUP_LOCATION_LABELS: Record<BackupItem["location"], string> = {
	nas: "NAS",
	drive: "Drive",
};
