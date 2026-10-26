// Panneau ouvert dans le tableau, un seul à la fois : les DLC d'une version jouée, ou le menu Actions d'une ligne
export type TablePopover =
	| { kind: "dlc"; userVersionId: number }
	// userVersionId null : menu de la ligne du jeu
	| { kind: "actionsMenu"; gameId: number; userVersionId: number | null };
