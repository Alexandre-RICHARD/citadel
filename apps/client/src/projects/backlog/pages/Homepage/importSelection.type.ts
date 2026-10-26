/**
 * Cases de la modale du jeu ; ce qui est déjà en base y est coché d'office et n'en fait pas partie. Toutes les versions
 * et tous les DLC sont proposés, seuls ceux cochés sont enregistrés : le backlog est personnel, et le type IGDB ne trie
 * pas (une petite quête gratuite de The Witcher 3 y est un DLC, comme Dawnguard pour Skyrim). Les DLC en base fixent
 * le « total » de « faits / total »
 */
export type ImportSelection = {
	// Versions à enregistrer ; l'originale l'est toujours, car elle porte l'id et la page IGDB du jeu
	versionIds: number[];
	dlcIds: number[];
	// DLC à ajouter ensuite comme jeux à part, qu'ils soient aussi enregistrés comme DLC ou non
	dlcAsGameIds: number[];
};
