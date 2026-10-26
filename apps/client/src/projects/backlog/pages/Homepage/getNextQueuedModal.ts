import type { BacklogModal } from "./backlogModal.type";

// Modale suivante de l'enchaînement : l'ajout du prochain DLC « comme jeu » de la file, sinon aucune
export function getNextQueuedModal(
	queuedIgdbIds: number[],
): BacklogModal | null {
	const [igdbId, ...otherIgdbIds] = queuedIgdbIds;
	return igdbId === undefined
		? null
		: { kind: "addGame", igdbId, queuedIgdbIds: otherIgdbIds };
}
