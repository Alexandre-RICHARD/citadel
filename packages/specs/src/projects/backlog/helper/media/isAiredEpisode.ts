// Un épisode diffusé : sa date est connue et passée (ou aujourd'hui). Les autres restent hors de la progression (§5)
export function isAiredEpisode(airDate: string | null, today: string): boolean {
	return airDate !== null && airDate <= today;
}
