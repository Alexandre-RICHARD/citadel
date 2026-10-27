import { TransitionEffectEnum } from "../projectTransition/transitionEffect.enum";
import { BackgroundEffectEnum } from "./backgroundEffect.enum";
import { buildPlaceholderFacts } from "./buildPlaceholderFacts";
import type { ProjectShowcase } from "./projectShowcase.type";

export const satisfactoryShowcase: ProjectShowcase = {
	kicker: "Jeu vidéo · Usine",
	lead: "Projet en lien avec le jeu éponyme : recettes, calculateur de production et suivi de l’usine en direct.",
	facts: buildPlaceholderFacts(0),
	tip: "le calculateur part du produit voulu et remonte toute la chaîne de production.",
	progress: 20,
	requiresAuth: false,
	backgroundEffect: BackgroundEffectEnum.HexGrid,
	transitionEffect: TransitionEffectEnum.Hexes,
};
