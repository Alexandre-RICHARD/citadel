// Une durée TMDB en minutes : TMDB écrit 0 (ou rien) quand il ne la connaît pas
export function toTmdbRuntime(
	minutes: number | null | undefined,
): number | null {
	return minutes !== null && minutes !== undefined && minutes > 0
		? minutes
		: null;
}
