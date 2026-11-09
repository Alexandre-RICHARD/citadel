import type { PlatformFm } from "../../api/model/platformFm.type";

// Ce que les deux listes du choix d'une plateforme affichent
export type PlatformChoice = {
	// Premier choix : les plateformes sans parent
	platforms: PlatformFm[];
	// La plateforme choisie, ou celle dont la sous-plateforme l'est ; null avant tout choix
	parentId: number | null;
	// Second choix : les sous-plateformes de la plateforme choisie, vide si elle n'en a pas
	subPlatforms: PlatformFm[];
	// null : la plateforme elle-même
	subPlatformId: number | null;
};
