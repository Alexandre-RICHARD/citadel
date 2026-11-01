// Un dump de la base, dans /Volume2/backups/db/<kind>/ ou db/<kind>/ sur le Drive (index
// écrit par infra-ops)
export type BackupItem = {
	location: "nas" | "drive";
	// <kind>/<name> sur le HDD, drive:<kind>/<name> sur le Drive : ce que la console
	// renvoie pour le restaurer ou le supprimer
	path: string;
	kind: "daily" | "pre-deploy" | "pre-restore";
	name: string;
	sizeBytes: number;
};
