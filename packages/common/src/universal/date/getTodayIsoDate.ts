import { formatLocalIsoDate } from "./formatLocalIsoDate.ts";
import type { IsoDate } from "./isoDate.type.ts";

export function getTodayIsoDate(): IsoDate {
	return formatLocalIsoDate(new Date());
}
