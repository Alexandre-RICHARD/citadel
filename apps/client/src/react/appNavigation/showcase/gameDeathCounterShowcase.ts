import { TransitionEffectEnum } from "../projectTransition/transitionEffect.enum";
import { BackgroundEffectEnum } from "./backgroundEffect.enum";
import type { ProjectShowcase } from "./projectShowcase.type";

export const gameDeathCounterShowcase: ProjectShowcase = {
	kicker: "Jeux vidéo · Souls-like",
	lead: "Le compteur de morts des jeux de type Souls : chaque boss, chaque tentative, chaque partie.",
	facts: [
		{
			title: "À quoi ça sert",
			text: "Garder la trace de chaque mort, jeu par jeu et boss par boss, datée et commentée si l’on veut : pour savoir qui vous a le plus résisté.",
		},
		{
			title: "Pour qui",
			text: "Les joueurs de Souls-like qui aiment compter leurs échecs, et s’en souvenir une fois le boss enfin tombé.",
		},
		{
			title: "Comment ça marche",
			text: "Un jeu, ses boss, et un bouton « +1 » à chaque mort. Boss vaincus et jeux terminés se marquent, les totaux se calculent seuls.",
		},
	],
	tip: "chaque mort compte, même celles contre le premier boss.",
	progress: 90,
	requiresAuth: true,
	backgroundEffect: BackgroundEffectEnum.Embers,
	transitionEffect: TransitionEffectEnum.Fire,
};
