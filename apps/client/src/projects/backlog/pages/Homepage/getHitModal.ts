import type { GameHitFm } from "../../api/model/gameHitFm.type";
import type { BacklogModal } from "./backlogModal.type";

/**
 * Un jeu trouvé mène à la modale d'ajout ; déjà en base, à l'ajout au backlog (ou d'une version jouée), la version
 * trouvée pré-sélectionnée (cahier des charges, §8)
 */
export function getHitModal(hit: GameHitFm): BacklogModal {
	return hit.storedGameId === null
		? { kind: "addGame", igdbId: hit.id, queuedIgdbIds: [] }
		: {
				kind: "addUserVersion",
				gameId: hit.storedGameId,
				versionId: hit.id,
				imageIds: null,
				queuedIgdbIds: [],
			};
}
