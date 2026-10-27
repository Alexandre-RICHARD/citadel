import { TransitionEffectEnum } from "../projectTransition/transitionEffect.enum";
import { BackgroundEffectEnum } from "./backgroundEffect.enum";
import type { ProjectShowcase } from "./projectShowcase.type";

export const angersIrigoShowcase: ProjectShowcase = {
	kicker: "Transports · Angers",
	lead: "Les bus et les trams d’Angers en temps réel, sur une carte : où ils sont, quand ils passent.",
	facts: [
		{
			title: "À quoi ça sert",
			text: "Voir où sont les bus et les trams, et quand ils passent à son arrêt, pour partir de chez soi au bon moment.",
		},
		{
			title: "Pour qui",
			text: "Les usagers du réseau Irigo, sur téléphone surtout : en attendant à l’arrêt, ou juste avant de sortir.",
		},
		{
			title: "Comment ça marche",
			text: "Chaque minute, la carte lit les positions et les prochains passages publiés par Irigo, et les complète avec ses horaires théoriques : ligne, destination, tracé.",
		},
	],
	tip: "les arrêts mis en favori restent à portée, dans leur encadré, d’une visite à l’autre.",
	progress: 85,
	requiresAuth: false,
	backgroundEffect: BackgroundEffectEnum.Stripes,
	transitionEffect: TransitionEffectEnum.Tram,
};
