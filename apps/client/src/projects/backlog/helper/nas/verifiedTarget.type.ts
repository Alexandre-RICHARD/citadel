// Ce que coche une case « Vérifié » d'une série : la série, une saison, ou un épisode
export type VerifiedTarget =
	| { kind: "show" }
	| { kind: "season"; seasonId: number }
	| { kind: "episode"; episodeId: number };
