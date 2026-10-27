import { useCallback, useState } from "react";

import type { ShowcaseProject } from "../../../../routing/showcaseProject.type";
import type { PresentationPanelState } from "./presentationPanelState.type";

// Attente avant l'entrée du nouveau panneau, en secondes : le temps que l'ancien tombe un peu, moins si une sortie
// était déjà en cours (clics rapprochés), presque rien avec les animations réduites
const DELAY_AFTER_GHOST = 0.9;
const DELAY_AFTER_SEVERAL_GHOSTS = 0.35;
const DELAY_REDUCED = 0.2;

type Sequence = {
	nextId: number;
	panels: PresentationPanelState[];
};

// Les panneaux affichés l'un sur l'autre : celui en place, et ceux qui sortent en fantôme.
// Changer de sélection fait sortir le panneau en place et entrer le nouveau ; un clic pendant une transition
// l'interrompt : un panneau qui n'avait pas encore commencé à entrer disparaît sans sortie
export function usePanelSequence(
	project: ShowcaseProject | null,
	reducedMotion: boolean,
) {
	const [sequence, setSequence] = useState<Sequence>({
		nextId: 1,
		panels: [
			{
				id: 0,
				project,
				isGhost: false,
				isFastGhost: false,
				hasEntered: false,
				enterDelay: 0,
			},
		],
	});

	// Ajusté pendant le rendu : le nouveau panneau existe dès le rendu qui change la sélection
	const livePanel = sequence.panels.find((panel) => !panel.isGhost);
	if (livePanel?.project !== project) {
		const ghostCount = sequence.panels.filter((panel) => panel.isGhost).length;
		const hasGhosts = ghostCount > 0;
		// Le panneau en place sort en fantôme s'il avait commencé à entrer ; sinon il disparaît
		const isLiveLeaving = livePanel?.hasEntered ?? false;
		const remainingPanels = sequence.panels
			.filter((panel) => panel.isGhost || panel.hasEntered)
			.map((panel) =>
				panel.isGhost
					? panel
					: { ...panel, isGhost: true, isFastGhost: hasGhosts },
			);
		const leavingDelay = reducedMotion
			? DELAY_REDUCED
			: hasGhosts
				? DELAY_AFTER_SEVERAL_GHOSTS
				: DELAY_AFTER_GHOST;
		const enterDelay = isLiveLeaving
			? leavingDelay
			: hasGhosts
				? DELAY_AFTER_SEVERAL_GHOSTS
				: 0;
		setSequence({
			nextId: sequence.nextId + 1,
			panels: [
				...remainingPanels,
				{
					id: sequence.nextId,
					project,
					isGhost: false,
					isFastGhost: false,
					hasEntered: false,
					enterDelay,
				},
			],
		});
	}

	const markEntered = useCallback((id: number) => {
		setSequence((current) => ({
			...current,
			panels: current.panels.map((panel) =>
				panel.id === id ? { ...panel, hasEntered: true } : panel,
			),
		}));
	}, []);

	const removePanel = useCallback((id: number) => {
		setSequence((current) => ({
			...current,
			panels: current.panels.filter((panel) => panel.id !== id),
		}));
	}, []);

	return { panels: sequence.panels, markEntered, removePanel };
}
