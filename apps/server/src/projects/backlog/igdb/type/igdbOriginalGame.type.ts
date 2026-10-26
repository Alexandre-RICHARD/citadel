import type { IgdbAlternativeName } from "./igdbAlternativeName.type.ts";
import type { IgdbCompany } from "./igdbCompany.type.ts";

// Données propres au jeu, lues sur sa fiche originale
export type IgdbOriginalGame = {
	id: number;
	name: string;
	alternative_names?: IgdbAlternativeName[];
	first_release_date?: number;
	game_status?: number;
	artworks?: { image_id: string }[];
	// `as_child_relations` : de quoi garder la plus large (cahier des charges, §3)
	collections?: {
		id: number;
		name: string;
		as_child_relations?: { parent_collection?: number }[];
	}[];
	franchise?: { id: number; name: string };
	franchises?: { id: number; name: string }[];
	involved_companies?: {
		developer: boolean;
		publisher: boolean;
		company: IgdbCompany;
	}[];
};
