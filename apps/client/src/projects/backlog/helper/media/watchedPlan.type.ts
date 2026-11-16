import type { WatchedChange } from "./watchedChange.type";

/**
 * Ce que fait un clic sur une case « Vu » d'une série (§5) :
 * - `direct` : un seul épisode change, sans question ;
 * - `cascade` : une série ou une saison coche ou décoche plusieurs épisodes, après confirmation ;
 * - `extend` : un épisode, avec la proposition de changer aussi ses précédents (cochés) ou ses suivants (décochés)
 */
export type WatchedPlan =
	| { kind: "direct"; change: WatchedChange }
	| { kind: "cascade"; change: WatchedChange }
	| { kind: "extend"; change: WatchedChange; extended: WatchedChange };
