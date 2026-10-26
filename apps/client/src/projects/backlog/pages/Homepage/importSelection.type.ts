// Cases de la modale du jeu (cahier des charges, §8) ; ce qui est déjà en base y est coché d'office et n'en fait pas partie
export type ImportSelection = {
	// Versions à enregistrer ; l'originale l'est toujours
	versionIds: number[];
	dlcIds: number[];
	// DLC à ajouter ensuite comme jeux à part, qu'ils soient aussi enregistrés comme DLC ou non
	dlcAsGameIds: number[];
};
