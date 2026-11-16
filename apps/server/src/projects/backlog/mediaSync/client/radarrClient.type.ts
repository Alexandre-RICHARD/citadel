import type { ArrQueue } from "./arrQueue.type.ts";
import type { RadarrMovie } from "./radarrMovie.type.ts";

export type RadarrClient = {
	movies: () => Promise<RadarrMovie[]>;
	queue: () => Promise<ArrQueue>;
};
