// La clé d'un épisode dans l'index du relevé
export function episodeIndexKey(
	seasonNumber: number,
	episodeNumber: number,
): string {
	return `${seasonNumber}:${episodeNumber}`;
}
