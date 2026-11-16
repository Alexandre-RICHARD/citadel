import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";

import type { MediaRowFm } from "../../api/model/media/mediaRowFm.type";
import type { WatchedPlan } from "../../helper/media/watchedPlan.type";
import type { VerifiedPlan } from "../../helper/nas/verifiedPlan.type";

// La modale ouverte du backlog des films et séries, avec seulement ce qui l'identifie : chacune lit ses données et garde sa saisie
export type MediaModal =
	// Fiche d'un film ou d'une série trouvé sur TMDB, puis ajout
	| { kind: "addMedia"; mediaType: MediaTypeEnum; tmdbId: number }
	// « Personnaliser » : la ligne telle qu'à l'ouverture, pour partir de sa miniature, de sa saga et de son numéro
	| { kind: "customizeMedia"; row: MediaRowFm }
	// `userMediaId` : le média d'où le menu a été ouvert, mis en valeur
	| {
			kind: "reorderSaga";
			sagaId: number;
			sagaName: string;
			userMediaId: number;
	  }
	// Retrait du backlog : confirmé, il n'y a plus d'annulation
	| { kind: "confirmRemoval"; row: MediaRowFm }
	// Une case « Vu » qui touche plusieurs épisodes : `subject` la nomme (« Saison 2 », « l'épisode 3 »)
	| {
			kind: "confirmWatched";
			userMediaId: number;
			title: string;
			subject: string;
			plan: Exclude<WatchedPlan, { kind: "direct" }>;
	  }
	// Une case « Vérifié » qui touche plusieurs épisodes (mode connecté)
	| {
			kind: "confirmVerified";
			userMediaId: number;
			title: string;
			subject: string;
			plan: VerifiedPlan;
	  }
	// Le mot de passe des médias, pour ouvrir le mode connecté
	| { kind: "unlockNas" }
	| { kind: "importList" }
	| { kind: "showUpdates" }
	| { kind: "editColumns" };
