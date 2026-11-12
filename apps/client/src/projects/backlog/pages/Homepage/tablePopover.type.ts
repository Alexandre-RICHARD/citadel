// Panneau ouvert dans le tableau, un seul à la fois : les DLC d'une version jouée, ou le menu Actions d'une ligne
export type TablePopover =
	| { kind: "dlc"; userVersionId: number }
	// userVersionId null : menu de la ligne du jeu. pointer : ouvert par clic droit, le menu s'ouvre sous le curseur ;
	// null : ouvert par le bouton « Actions », le menu s'ouvre contre lui
	| {
			kind: "actionsMenu";
			gameId: number;
			userVersionId: number | null;
			pointer: { x: number; y: number } | null;
	  };
