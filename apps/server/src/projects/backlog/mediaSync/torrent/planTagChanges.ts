import { INVALID_TRACKER_TAG } from "./invalidTrackerTag.ts";
import type { SurveyedTorrent } from "./surveyedTorrent.type.ts";
import { TorrentStatusEnum } from "./torrentStatus.enum.ts";

function hasTag({ tags }: SurveyedTorrent): boolean {
	return tags.includes(INVALID_TRACKER_TAG);
}

function isDead({ status }: SurveyedTorrent): boolean {
	return status === TorrentStatusEnum.DEAD;
}

// Les torrents où poser l'étiquette tracker-invalide (morts, sans elle) et ceux où la retirer (revenus, avec elle)
export function planTagChanges(torrents: readonly SurveyedTorrent[]): {
	toAdd: string[];
	toRemove: string[];
} {
	return {
		toAdd: torrents
			.filter((torrent) => isDead(torrent) && !hasTag(torrent))
			.map(({ hash }) => hash),
		toRemove: torrents
			.filter((torrent) => !isDead(torrent) && hasTag(torrent))
			.map(({ hash }) => hash),
	};
}
