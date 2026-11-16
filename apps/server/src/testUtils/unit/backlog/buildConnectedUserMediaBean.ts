import { NasSharingEnum } from "@citadel/specs/src/projects/backlog/enum/nasSharing.enum.ts";
import { NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum.ts";

import type { ConnectedUserMediaBean } from "../../../projects/backlog/bean/connectedUserMediaBean.type.ts";
import type { NasDetailsBean } from "../../../projects/backlog/nas/merge/nasDetailsBean.type.ts";
import { buildUserMediaBean } from "./buildUserMediaBean.ts";

// Un film du backlog dans Jellyfin, avec un fichier sans torrent ; `nas` : ses colonnes du NAS qui changent
export function buildConnectedUserMediaBean(
	id: number,
	nas: Partial<NasDetailsBean> = {},
): ConnectedUserMediaBean {
	return {
		...buildUserMediaBean({ id }),
		nas: {
			storage: NasStorageEnum.IN_JELLYFIN,
			episodeCount: null,
			fileCount: 1,
			jellyfinItemId: null,
			jellyfinCollection: null,
			sharing: NasSharingEnum.NONE,
			torrents: [],
			quality: null,
			languageTags: [],
			sizeBytes: null,
			gbPerHour: null,
			fileMinutes: null,
			isRuntimeMismatch: false,
			gaps: [],
			verifiedCount: 0,
			verifiableCount: 1,
			...nas,
		},
	};
}
