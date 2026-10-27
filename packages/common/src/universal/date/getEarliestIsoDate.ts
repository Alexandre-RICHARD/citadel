// Dates ISO : l'ordre du texte est celui du calendrier. null sans date connue
export function getEarliestIsoDate(
	isoDates: readonly (string | null)[],
): string | null {
	return isoDates.reduce<string | null>(
		(earliest, isoDate) =>
			isoDate !== null && (earliest === null || isoDate < earliest)
				? isoDate
				: earliest,
		null,
	);
}
