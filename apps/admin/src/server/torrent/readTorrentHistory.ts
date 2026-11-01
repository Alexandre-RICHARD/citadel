import type { TorrentHistory } from "../../shared/torrentHistory.type.ts";
import { readStateText } from "../state/readStateText.ts";
import { summarizeTorrentHistory } from "./summarizeTorrentHistory.ts";
import type { TorrentSample } from "./torrentSample.type.ts";

function parseSample(line: string): TorrentSample | null {
	try {
		const sample = JSON.parse(line) as Partial<TorrentSample>;
		return typeof sample.at === "string" &&
			typeof sample.downloaded === "number" &&
			typeof sample.uploaded === "number"
			? {
					at: sample.at,
					downloaded: sample.downloaded,
					uploaded: sample.uploaded,
				}
			: null;
	} catch {
		return null;
	}
}

// Les relevés horaires du job qbittorrent-stats d'infra-ops
export async function readTorrentHistory(): Promise<TorrentHistory> {
	const content = (await readStateText("qbittorrent-stats.jsonl")) ?? "";
	const samples = content
		.split("\n")
		.map(parseSample)
		.filter((sample) => sample !== null);
	return summarizeTorrentHistory(samples, new Date());
}
