import { TransitionEffectEnum } from "../projectTransition/transitionEffect.enum";
import { BackgroundEffectEnum } from "./backgroundEffect.enum";
import type { ProjectShowcase } from "./projectShowcase.type";

export const backlogShowcase: ProjectShowcase = {
	kicker: "Jeux vidéo · Suivi",
	lead: "Le suivi du backlog : ce qui attend, ce qui est en cours, ce qui est fini, avec les données d’IGDB.",
	facts: [
		{
			title: "À quoi ça sert",
			text: "Savoir où l’on en est de ses jeux, plateforme par plateforme : statut, temps passé, note, DLC faits ou à faire.",
		},
		{
			title: "Pour qui",
			text: "Ceux dont la pile de jeux à faire grandit plus vite qu’elle ne descend. Un seul backlog pour l’instant : un par personne, une fois les comptes en place.",
		},
		{
			title: "Comment ça marche",
			text: "On cherche un jeu sur IGDB, on l’enregistre avec ses versions et ses DLC, puis on le suit dans un tableau qui se trie et se filtre.",
		},
	],
	tip: "les colonnes du tableau se réorganisent et se masquent, et la disposition est gardée.",
	progress: 70,
	requiresAuth: true,
	backgroundEffect: BackgroundEffectEnum.Shapes,
	transitionEffect: TransitionEffectEnum.Tiles,
};
