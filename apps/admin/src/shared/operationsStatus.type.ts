import type { BackupItem } from "./backupItem.type.ts";
import type { SiteBanner } from "./siteBanner.type.ts";

// Ce que la section « Mises en production » et la zone de danger affichent
export type OperationsStatus = {
	currentVersion: string | null;
	// Celle où `citadel rollback` reviendrait ; null : aucune
	previousVersion: string | null;
	// Les versions publiées sur GHCR, de la plus ancienne à la plus récente (update-check)
	publishedVersions: string[];
	versionsCheckedAt: string | null;
	// Ceux du HDD et du Drive, du plus récent au plus ancien
	backups: BackupItem[];
	// Le Drive injoignable au dernier relevé : seuls ceux du HDD sont listés
	backupsDriveError: string | null;
	banner: SiteBanner | null;
	maintenance: boolean;
};
