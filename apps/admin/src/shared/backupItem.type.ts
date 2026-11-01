// Un dump de la base, dans /Volume2/backups/db/<kind>/ (index écrit par infra-ops)
export type BackupItem = {
	// <kind>/<name> : ce que la console renvoie pour le restaurer
	path: string;
	kind: "daily" | "pre-deploy" | "pre-restore";
	name: string;
	sizeBytes: number;
};
