import type { IgdbAlternativeName } from "./igdbAlternativeName.type.ts";

// Fiche renvoyée par la recherche, avec de quoi remonter à son jeu de base ; un champ sans valeur est absent
export type IgdbSearchGame = {
	id: number;
	name: string;
	game_type?: number;
	version_parent?: number;
	parent_game?: number;
	// Bundles qui contiennent cette fiche
	bundles?: number[];
	// Timestamp Unix, en secondes
	first_release_date?: number;
	cover?: { image_id: string };
	alternative_names?: IgdbAlternativeName[];
	platforms?: { name: string; abbreviation?: string }[];
};
