// La case « Vu » cliquée sur une série : celle de la série, d'une saison ou d'un épisode
export type WatchedTarget =
	| { kind: "show" }
	| { kind: "season"; seasonId: number }
	| { kind: "episode"; episodeId: number };
