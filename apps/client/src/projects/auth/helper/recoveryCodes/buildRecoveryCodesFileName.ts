const FILE_DATE_LENGTH = 10;

// Le nom du fichier téléchargé
export function buildRecoveryCodesFileName(date: Date): string {
	return `citadel-codes-de-secours-${date.toISOString().slice(0, FILE_DATE_LENGTH)}.txt`;
}
