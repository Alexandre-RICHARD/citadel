import type { IsoDate } from "./isoDate.type";

// Date du jour, en heure locale
export function getTodayIsoDate(): IsoDate {
	const now = new Date();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${now.getFullYear()}-${month}-${day}` as IsoDate;
}
