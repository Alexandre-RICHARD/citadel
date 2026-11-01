// Une ligne de state/qbittorrent-stats.jsonl : les compteurs « depuis toujours » de
// qBittorrent, relevés chaque heure par infra-ops
export type TorrentSample = {
	at: string;
	downloaded: number;
	uploaded: number;
};
