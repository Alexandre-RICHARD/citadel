/**
 * La modale ouverte, avec seulement ce qui l'identifie : chacune lit ses données et garde sa saisie.
 * `queuedIgdbIds` : DLC cochés « comme jeu », dont la modale d'ajout s'ouvrira l'un après l'autre (cahier des charges, §8).
 * Fermer une modale de l'enchaînement, même par « Annuler », ouvre le DLC suivant
 */
export type BacklogModal =
	// Ajout d'un jeu trouvé sur IGDB, pas encore en base
	| { kind: "addGame"; igdbId: number; queuedIgdbIds: number[] }
	// « Ma base » : les jeux en base hors backlog
	| { kind: "addFromDatabase" }
	/**
	 * Ajout au backlog, ou « Ajouter une version jouée » pour un jeu qui y est déjà. `versionId` : la version
	 * pré-sélectionnée ; `imageIds` : les images déjà lues sur IGDB par la modale d'ajout
	 */
	| {
			kind: "addUserVersion";
			gameId: number;
			versionId: number | null;
			imageIds: string[] | null;
			queuedIgdbIds: number[];
	  }
	// « Modifier le jeu » : les versions et DLC IGDB absents de la base
	| { kind: "editGame"; gameId: number }
	// « Rechercher d'autres DLC »
	| { kind: "addDlcs"; gameId: number; gameName: string }
	| { kind: "customizeGame"; gameId: number }
	// `gameId` : le jeu d'où le menu a été ouvert, mis en valeur
	| { kind: "reorderSeries"; seriesId: number; gameId: number }
	// Proposée au passage d'une version jouée au rang 5 ou plus sans date de fin (§6)
	| {
			kind: "setFinishDate";
			gameId: number;
			userVersionId: number;
			gameName: string;
			platformName: string;
	  }
	// Retrait du backlog, ou d'une version jouée : confirmé, il n'y a plus d'annulation
	| {
			kind: "confirmRemoval";
			gameId: number;
			// null : tout le jeu
			userVersionId: number | null;
			gameName: string;
			platformName: string | null;
			userVersionCount: number;
	  }
	| { kind: "editColumns" };
