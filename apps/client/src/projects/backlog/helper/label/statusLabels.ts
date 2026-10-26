import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum";

// Libellé et signification de chaque statut (cahier des charges, §6)
export const statusLabels: Readonly<
	Record<StatusEnum, { label: string; meaning: string }>
> = {
	[StatusEnum.NOT_STARTED]: {
		label: "Pas commencé",
		meaning: "Dans le backlog, jamais lancé",
	},
	[StatusEnum.WATCHED]: {
		label: "Vu sans jouer",
		meaning: "Je l'ai fait avec des amis",
	},
	[StatusEnum.STARTED]: {
		label: "Démarré",
		meaning: "Lancé, quelques heures de jeu",
	},
	[StatusEnum.WELL_UNDERWAY]: {
		label: "Bien entamé",
		meaning: "Bonne progression, pas encore fini",
	},
	[StatusEnum.FINISHED]: { label: "Fini", meaning: "Fin principale atteinte" },
	[StatusEnum.DEEMED_FINISHED]: {
		label: "Estimé fini",
		meaning: "Pas de fin officielle, mais je le considère fini",
	},
	[StatusEnum.COMPLETED]: {
		label: "Complété (100 %)",
		meaning:
			"Fini, et tout le contenu fait : quêtes annexes, collectibles, fins secondaires",
	},
	[StatusEnum.PLATINUM]: {
		label: "Platiné",
		meaning: "Fini, et tous les succès ou trophées de la plateforme obtenus",
	},
	[StatusEnum.COMPLETED_AND_PLATINUM]: {
		label: "Complété et Platiné",
		meaning: "Les deux à la fois",
	},
	[StatusEnum.ABANDONED]: {
		label: "Abandonné",
		meaning: "Arrêté sans intention d'y revenir",
	},
};
