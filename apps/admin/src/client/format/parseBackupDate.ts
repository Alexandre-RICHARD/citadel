// La date d'une sauvegarde, lue dans son nom : citadel-AAAAMMJJ-HHMMSS-… (heure locale
// du NAS). null : un nom qui ne suit pas ce modèle.
const BACKUP_NAME = /^citadel-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})-/;

export function parseBackupDate(name: string): Date | null {
	const match = BACKUP_NAME.exec(name);
	if (!match) return null;
	const [year, month, day, hours, minutes, seconds] = match
		.slice(1)
		.map(Number) as [number, number, number, number, number, number];
	return new Date(year, month - 1, day, hours, minutes, seconds);
}
