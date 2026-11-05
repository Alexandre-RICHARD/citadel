// Ce que le rejeu a fait, compté pour la sortie de la commande « après restauration »
export type RestoreReplayReportBean = {
	replayed: number;
	// Le compte n'est pas dans la sauvegarde (créé après elle) : rien à refaire
	skippedMissingAccount: number;
	// La nouvelle adresse appartient à un autre compte de la sauvegarde : l'ancienne reste
	emailConflicts: number;
	invalidatedPasswords: number;
};
