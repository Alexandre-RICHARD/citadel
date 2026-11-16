import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";
import type { NasToolEnum } from "@citadel/specs/src/projects/backlog/enum/nasTool.enum.ts";

// Un média du NAS absent du backlog ; voir ForgottenMediaDto
export type ForgottenMediaBean = {
	tmdbId: number | null;
	mediaType: MediaTypeEnum | null;
	title: string | null;
	year: number | null;
	path: string | null;
	trackedBy: NasToolEnum | null;
	fileCount: number;
	sizeBytes: number;
	isInJellyfin: boolean;
	torrentCount: number;
};
