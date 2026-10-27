import { TransitionEffectEnum } from "../projectTransition/transitionEffect.enum";
import { BackgroundEffectEnum } from "./backgroundEffect.enum";
import type { ProjectShowcase } from "./projectShowcase.type";

export const satisfactoryShowcase: ProjectShowcase = {
	kicker: "Jeu vidéo · Usine",
	lead: "Projet en lien avec le jeu éponyme : recettes, calculateur de production et suivi de l’usine en direct.",
	facts: [
		{
			title: "À quoi ça sert",
			text: "Planifier et surveiller son usine : les recettes, les chaînes de production à monter, et l’état des machines pendant la partie.",
		},
		{
			title: "Pour qui",
			text: "Les joueurs de Satisfactory qui jonglent avec des dizaines de chaînes, et préfèrent un tableau à un carnet de notes.",
		},
		{
			title: "Comment ça marche",
			text: "Le suivi en direct lit le mod Ficsit Remote Monitoring, lancé avec la partie sur le PC du joueur. Les recettes et le calculateur sont encore à construire.",
		},
	],
	tip: "le suivi en direct a besoin du mod Ficsit Remote Monitoring, lancé avec la partie.",
	progress: 20,
	requiresAuth: false,
	backgroundEffect: BackgroundEffectEnum.HexGrid,
	transitionEffect: TransitionEffectEnum.Hexes,
};
