import { TransitionEffectEnum } from "../projectTransition/transitionEffect.enum";
import { BackgroundEffectEnum } from "./backgroundEffect.enum";
import { buildPlaceholderFacts } from "./buildPlaceholderFacts";
import type { ProjectShowcase } from "./projectShowcase.type";

export const backlogShowcase: ProjectShowcase = {
	kicker: "Jeux, films et séries",
	lead: "Le suivi du backlog : ce qui attend, ce qui est en cours, ce qui est fini, avec les données d’IGDB.",
	facts: buildPlaceholderFacts(2),
	tip: "les colonnes du tableau se réorganisent et se masquent, et la disposition est gardée.",
	progress: 70,
	requiresAuth: true,
	backgroundEffect: BackgroundEffectEnum.Shapes,
	transitionEffect: TransitionEffectEnum.Tiles,
};
