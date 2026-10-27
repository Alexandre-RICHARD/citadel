import { TransitionEffectEnum } from "../projectTransition/transitionEffect.enum";
import { BackgroundEffectEnum } from "./backgroundEffect.enum";
import { buildPlaceholderFacts } from "./buildPlaceholderFacts";
import type { ProjectShowcase } from "./projectShowcase.type";

export const gameDeathCounterShowcase: ProjectShowcase = {
	kicker: "Jeux vidéo · Souls-like",
	lead: "Le compteur de morts des jeux de type Souls : chaque boss, chaque tentative, chaque partie.",
	facts: buildPlaceholderFacts(1),
	tip: "chaque mort compte, même celles contre le premier boss.",
	progress: 90,
	requiresAuth: true,
	backgroundEffect: BackgroundEffectEnum.Embers,
	transitionEffect: TransitionEffectEnum.Fire,
};
