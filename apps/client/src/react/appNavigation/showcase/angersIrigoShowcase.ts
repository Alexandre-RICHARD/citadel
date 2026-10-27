import { TransitionEffectEnum } from "../projectTransition/transitionEffect.enum";
import { BackgroundEffectEnum } from "./backgroundEffect.enum";
import { buildPlaceholderFacts } from "./buildPlaceholderFacts";
import type { ProjectShowcase } from "./projectShowcase.type";

export const angersIrigoShowcase: ProjectShowcase = {
	kicker: "Transports · Angers",
	lead: "Les bus et les trams d’Angers en temps réel, sur une carte : où ils sont, quand ils passent.",
	facts: buildPlaceholderFacts(3),
	tip: "un arrêt mis en favori s’ouvre directement au lancement.",
	progress: 85,
	requiresAuth: false,
	backgroundEffect: BackgroundEffectEnum.Stripes,
	transitionEffect: TransitionEffectEnum.Tram,
};
