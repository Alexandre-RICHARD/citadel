import type { ShowcaseProject } from "../../../../routing/showcaseProject.type";

// Un panneau de la présentation : l'accueil (project null) ou un projet
export type PresentationPanelState = {
	id: number;
	project: ShowcaseProject | null;
	// Il sort en fantôme ; isFastGhost : une autre sortie était déjà en cours, celle-ci se presse
	isGhost: boolean;
	isFastGhost: boolean;
	// Son entrée a commencé
	hasEntered: boolean;
	// Attente avant d'entrer, le temps que le panneau précédent commence à tomber, en secondes
	enterDelay: number;
};
