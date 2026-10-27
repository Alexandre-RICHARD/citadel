const MINUTES_PER_HOUR = 60;

// 150 → 2 h et 30 min
export function splitMinutesIntoHours(totalMinutes: number): {
	hours: number;
	minutes: number;
} {
	return {
		hours: Math.floor(totalMinutes / MINUTES_PER_HOUR),
		minutes: totalMinutes % MINUTES_PER_HOUR,
	};
}
