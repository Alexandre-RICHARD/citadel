import type { NasToolEnum } from "@citadel/specs/src/projects/backlog/enum/nasTool.enum.ts";

import type { ArrMediaInfo } from "../client/arrMediaInfo.type.ts";
import type { DiskFile } from "../disk/diskFile.type.ts";

/**
 * Un film ou un épisode avant d'être écrit dans le relevé. `mainFile` : celui de Radarr ou Sonarr, sinon le plus gros ;
 * `files` : tous ses fichiers vidéo distincts (d'inodes différents), le principal compris. `downloadHash` : son torrent
 * dans la file de Radarr ou de Sonarr
 */
export type MediaDraft = {
	mainFile: DiskFile | null;
	mediaInfo: ArrMediaInfo | null;
	files: DiskFile[];
	trackedBy: NasToolEnum | null;
	downloadHash: string | null;
};
