// Statuts d'une série dont TMDB attend encore des épisodes ; « Ended » et « Canceled » n'en auront plus
const ONGOING_STATUSES = new Set([
	"Returning Series",
	"In Production",
	"Planned",
	"Pilot",
]);

// Une série « en cours » : celles que le serveur relit chaque nuit pour leurs nouveaux épisodes (§7.3)
export function isOngoingTmdbShow(
	status: string | null,
	inProduction: boolean | null,
): boolean {
	return (
		inProduction === true || (status !== null && ONGOING_STATUSES.has(status))
	);
}
