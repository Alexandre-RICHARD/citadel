// TMDB ajoute au plus 20 sous-requêtes à une fiche (append_to_response)
const MAX_APPENDED = 20;

/**
 * Les saisons d'une série, lues 20 par 20 en les ajoutant à la fiche de la série : « season/0,season/1,… ». Une série
 * de 35 saisons coûte ainsi 2 requêtes au lieu de 35
 */
export function buildSeasonAppendBatches(seasonNumbers: number[]): string[] {
	const batches: string[] = [];
	for (let start = 0; start < seasonNumbers.length; start += MAX_APPENDED)
		batches.push(
			seasonNumbers
				.slice(start, start + MAX_APPENDED)
				.map((seasonNumber) => `season/${seasonNumber}`)
				.join(","),
		);
	return batches;
}
