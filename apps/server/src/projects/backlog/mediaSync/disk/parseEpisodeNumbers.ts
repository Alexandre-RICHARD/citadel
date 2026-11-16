// « S01E02 », « s1e2 » ou « 1x02 » dans un nom de fichier ; null sans numéros lisibles
export function parseEpisodeNumbers(
	fileName: string,
): { seasonNumber: number; episodeNumber: number } | null {
	const match =
		/s(?<season>\d{1,2})[ ._-]?e(?<episode>\d{1,3})/iu.exec(fileName) ??
		/\b(?<season>\d{1,2})x(?<episode>\d{2,3})\b/iu.exec(fileName);
	if (match?.groups === undefined) return null;
	return {
		seasonNumber: Number(match.groups.season),
		episodeNumber: Number(match.groups.episode),
	};
}
