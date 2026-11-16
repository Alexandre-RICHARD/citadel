import { NasSharingEnum } from "@citadel/specs/src/projects/backlog/enum/nasSharing.enum";
import { NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum";

import type { NasDetailsFm } from "../model/nas/nasDetailsFm.type";

// Un fichier dans Jellyfin, vérifiable, pas vérifié ; chaque test ne précise que ce qu'il compare
export function buildNasDetailsFm(
	overrides: Partial<NasDetailsFm> = {},
): NasDetailsFm {
	return {
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
		...overrides,
	};
}
