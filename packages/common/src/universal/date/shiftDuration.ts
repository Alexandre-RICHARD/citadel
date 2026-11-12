import type { DurationUnit } from "./durationUnit.type.ts";

const MINUTES_PER_HOUR = 60;

// Une durée décalée d'une heure ou d'une minute, jamais négative : 2 h 59 + 1 minute → 3 h 00, 0 h 00 - 1 minute → 0 h 00
export function shiftDuration(
	totalMinutes: number,
	unit: DurationUnit,
	direction: -1 | 1,
): number {
	const stepMinutes = unit === "hours" ? MINUTES_PER_HOUR : 1;
	return Math.max(0, totalMinutes + direction * stepMinutes);
}
