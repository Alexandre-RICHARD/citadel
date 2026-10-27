import type { TransitionEffectEnum } from "../projectTransition/transitionEffect.enum";
import type { BackgroundEffectEnum } from "./backgroundEffect.enum";
import type { ProjectFact } from "./projectFact.type";

// Comment la homepage présente un projet : textes, avancement, et effets de son ambiance
export type ProjectShowcase = {
	// Au-dessus du titre : « Jeux vidéo · Souls-like »
	kicker: string;
	lead: string;
	facts: ProjectFact[];
	// Affichée pendant la transition vers le projet, si son chargement traîne
	tip: string;
	// Avancement du projet, en pourcentage
	progress: number;
	// Le projet demandera de se connecter : un badge le signale à côté du bouton
	requiresAuth: boolean;
	backgroundEffect: BackgroundEffectEnum | null;
	transitionEffect: TransitionEffectEnum;
};
