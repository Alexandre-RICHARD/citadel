// Une semaine pour tout vérifier : chaque nuit, un septième des médias des backlogs, au moins un
const DAYS_PER_ROUND = 7;

export function tmdbCheckSliceSize(total: number): number {
	return Math.max(1, Math.ceil(total / DAYS_PER_ROUND));
}
