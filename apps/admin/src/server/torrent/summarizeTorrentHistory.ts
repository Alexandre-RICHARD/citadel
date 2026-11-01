import type { TorrentHistory } from "../../shared/torrentHistory.type.ts";
import type { TorrentVolume } from "../../shared/torrentVolume.type.ts";
import type { TorrentSample } from "./torrentSample.type.ts";

const DAY_COUNT = 7;
const WEEK_COUNT = 4;

// AAAA-MM-JJ à l'heure locale (Europe/Paris dans le conteneur)
function localDay(date: Date): string {
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${date.getFullYear()}-${month}-${day}`;
}

function mondayOf(date: Date): string {
	const monday = new Date(date);
	monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
	return localDay(monday);
}

// Les volumes par jour (7 derniers) et par semaine (4 dernières, du lundi), le plus
// récent en premier : chaque écart entre deux relevés compte pour le jour du second.
// Un compteur qui recule (qBittorrent réinstallé) ne compte pas.
export function summarizeTorrentHistory(
	samples: TorrentSample[],
	now: Date,
): TorrentHistory {
	const byDay = new Map<string, TorrentVolume>();
	const byWeek = new Map<string, TorrentVolume>();
	function add(
		map: Map<string, TorrentVolume>,
		period: string,
		downloaded: number,
		uploaded: number,
	): void {
		const volume = map.get(period) ?? { period, downloaded: 0, uploaded: 0 };
		volume.downloaded += downloaded;
		volume.uploaded += uploaded;
		map.set(period, volume);
	}

	const sorted = [...samples].sort(
		(first, second) => Date.parse(first.at) - Date.parse(second.at),
	);
	sorted.slice(1).forEach((sample, index) => {
		const previous = sorted[index];
		if (!previous) return;
		const downloaded = Math.max(0, sample.downloaded - previous.downloaded);
		const uploaded = Math.max(0, sample.uploaded - previous.uploaded);
		const date = new Date(sample.at);
		add(byDay, localDay(date), downloaded, uploaded);
		add(byWeek, mondayOf(date), downloaded, uploaded);
	});

	const days = Array.from({ length: DAY_COUNT }, (_, offset) => {
		const date = new Date(now);
		date.setDate(now.getDate() - offset);
		const period = localDay(date);
		return byDay.get(period) ?? { period, downloaded: 0, uploaded: 0 };
	});
	const weeks = Array.from({ length: WEEK_COUNT }, (_, offset) => {
		const date = new Date(now);
		date.setDate(now.getDate() - offset * 7);
		const period = mondayOf(date);
		return byWeek.get(period) ?? { period, downloaded: 0, uploaded: 0 };
	});
	return { days, weeks };
}
