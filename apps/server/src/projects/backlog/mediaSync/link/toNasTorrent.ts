import { NasSharingEnum } from "@citadel/specs/src/projects/backlog/enum/nasSharing.enum.ts";
import type { NasTorrent } from "@citadel/specs/src/projects/backlog/mediaState/nasTorrent.type.ts";

import type { SurveyedTorrent } from "../torrent/surveyedTorrent.type.ts";
import { TorrentStatusEnum } from "../torrent/torrentStatus.enum.ts";

const SHARING_BY_STATUS = {
	[TorrentStatusEnum.VALID]: NasSharingEnum.SEEDING,
	[TorrentStatusEnum.INACTIVE]: NasSharingEnum.TRACKER_UNREACHABLE,
	[TorrentStatusEnum.DEAD]: NasSharingEnum.ERROR,
} as const;

// Un torrent tel que le relevé le donne à l'instance locale : son tracker par son seul nom de MEDIA_TRACKERS
export function toNasTorrent({
	hash,
	name,
	tracker,
	status,
}: SurveyedTorrent): NasTorrent {
	return {
		hash,
		name,
		trackerName: tracker?.name ?? null,
		sharing: SHARING_BY_STATUS[status],
	};
}
