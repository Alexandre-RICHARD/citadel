import type { IsoDate } from "./isoDate.type.ts";
import { parseUtcIsoDate } from "./parseUtcIsoDate.ts";

// Lundi = 0 … dimanche = 6, l'ordre des semaines en France
export function getMondayBasedWeekday(isoDate: IsoDate): number {
	return (parseUtcIsoDate(isoDate).getUTCDay() + 6) % 7;
}
