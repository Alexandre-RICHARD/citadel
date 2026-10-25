// Une durée courte et lisible : « 45 s », « 12 min », « 3 h 05 », « 4 j 2 h »
export function formatDuration(totalSeconds: number): string {
	const seconds = Math.max(0, Math.floor(totalSeconds));
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (days > 0) return `${days} j ${hours} h`;
	if (hours > 0) return `${hours} h ${String(minutes).padStart(2, "0")}`;
	if (minutes > 0) return `${minutes} min`;
	return `${seconds} s`;
}
