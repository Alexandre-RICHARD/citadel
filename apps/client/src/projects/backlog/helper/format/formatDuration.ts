const MINUTES_PER_HOUR = 60;

// Minutes → « 12 h 30 »
export function formatDuration(minutes: number): string {
	return `${Math.floor(minutes / MINUTES_PER_HOUR)} h ${String(minutes % MINUTES_PER_HOUR).padStart(2, "0")}`;
}
