import type { JellyfinPlayback } from "./jellyfinPlayback.type.ts";
import type { Unavailable } from "./unavailable.type.ts";

export type JellyfinActivity =
	| {
			available: true;
			playbacks: JellyfinPlayback[];
			// Appareils actifs ces 10 dernières minutes, lecture ou non
			activeSessionCount: number;
	  }
	| Unavailable;
