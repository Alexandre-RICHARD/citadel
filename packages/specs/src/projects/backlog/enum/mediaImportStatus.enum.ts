// Où en est un import de liste
export enum MediaImportStatusEnum {
	// Le serveur lit les fiches sur TMDB, à son rythme
	READING = "reading",
	// Tout est lu : l'aperçu attend « Valider »
	READY = "ready",
	// TMDB a cessé de répondre : rien n'a été enregistré, l'import est à relancer
	FAILED = "failed",
}
