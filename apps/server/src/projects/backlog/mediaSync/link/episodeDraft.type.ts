import type { MediaDraft } from "./mediaDraft.type.ts";

// Un épisode avant d'être écrit dans le relevé, par ses numéros
export type EpisodeDraft = MediaDraft & {
	seasonNumber: number;
	episodeNumber: number;
};
