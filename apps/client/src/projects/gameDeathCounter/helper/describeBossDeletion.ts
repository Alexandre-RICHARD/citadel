// Annonce ce que la suppression emporte avec le boss
export function describeBossDeletion(totalDeath: number): string {
	if (totalDeath === 0) return "Cette action est définitive.";
	if (totalDeath === 1) return "Sa mort sera supprimée définitivement.";
	return `Ses ${totalDeath} morts seront supprimées définitivement.`;
}
