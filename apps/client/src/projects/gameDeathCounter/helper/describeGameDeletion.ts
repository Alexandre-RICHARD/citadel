// Annonce ce que la suppression emporte avec le jeu
export function describeGameDeletion(totalDeath: number): string {
	if (totalDeath === 0) return "Ses boss seront supprimés définitivement.";
	const deaths = totalDeath === 1 ? "sa mort" : `ses ${totalDeath} morts`;
	return `Ses boss et ${deaths} seront supprimés définitivement.`;
}
