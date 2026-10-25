import type { TorrentStats } from "../../shared/torrentStats.type.ts";
import { qbittorrentClient } from "./qbittorrentClient.ts";

type TransferInfo = {
	dl_info_speed: number;
	up_info_speed: number;
	dl_info_data: number;
	up_info_data: number;
};

type MainData = {
	server_state?: {
		alltime_dl?: number;
		alltime_ul?: number;
		global_ratio?: string;
	};
};

// Les totaux « depuis toujours » viennent de sync/maindata, qui renvoie aussi la liste
// de tous les torrents : lourd, donc relu au plus une fois par minute
const ALL_TIME_CACHE_MS = 60_000;
let allTimeCache: { readAt: number; data: MainData } | null = null;

async function readAllTime(): Promise<MainData> {
	if (allTimeCache && Date.now() - allTimeCache.readAt < ALL_TIME_CACHE_MS)
		return allTimeCache.data;
	const data = await qbittorrentClient.getJson<MainData>(
		"/api/v2/sync/maindata",
	);
	allTimeCache = { readAt: Date.now(), data };
	return data;
}

export async function readTorrentStats(): Promise<TorrentStats> {
	try {
		const [transfer, mainData] = await Promise.all([
			qbittorrentClient.getJson<TransferInfo>("/api/v2/transfer/info"),
			readAllTime(),
		]);
		const state = mainData.server_state;
		const ratio = Number.parseFloat(state?.global_ratio ?? "");
		return {
			available: true,
			downloadSpeed: transfer.dl_info_speed,
			uploadSpeed: transfer.up_info_speed,
			sessionDownloaded: transfer.dl_info_data,
			sessionUploaded: transfer.up_info_data,
			allTimeDownloaded: state?.alltime_dl ?? null,
			allTimeUploaded: state?.alltime_ul ?? null,
			ratio: Number.isFinite(ratio) ? ratio : null,
		};
	} catch (error) {
		allTimeCache = null;
		return {
			available: false,
			reason:
				error instanceof Error && error.message.startsWith("identifiants")
					? `qBittorrent : ${error.message}`
					: "qBittorrent arrêté ou injoignable",
		};
	}
}
