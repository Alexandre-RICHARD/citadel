import { formatDuration } from "./formatDuration";

// « il y a 3 min », par rapport à now (la dernière lecture de la console)
export function formatAgo(isoDate: string, now: number): string {
	return `il y a ${formatDuration((now - Date.parse(isoDate)) / 1000)}`;
}
