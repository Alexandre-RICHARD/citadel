import type { ProjectDictionary } from "./projectDictionary.type";
import { ProjectsEnum } from "./projects.enum";

export const projects: Record<ProjectsEnum, ProjectDictionary> = {
	[ProjectsEnum.Homepage]: {
		id: "homepage",
		path: "/homepage",
		name: "Homepage",
		description: "La page sur laquelle vous vous trouvez",
		documentTitle: "Alexandre Richard",
		favicon: "/favicon/home.ico",
		illustration: "/favicon/home.ico",
	},
	[ProjectsEnum.Test]: {
		id: "test",
		path: "/test",
		name: "Test",
		description: "Un projet uniquement fait pour tester des features",
		documentTitle: "Test",
		favicon: "/favicon/test.ico",
		illustration: "/favicon/test.ico",
	},
	[ProjectsEnum.Satisfactory]: {
		id: "satisfactory",
		path: "/satisfactory",
		name: "Satisfactory",
		description: "Projet en lien avec le jeu éponyme",
		documentTitle: "Satisfactory Calculator",
		favicon: "/favicon/satisfactory.ico",
		illustration: "/favicon/satisfactory.png",
	},
	[ProjectsEnum.GameDeathCount]: {
		id: "gameDeathCounter",
		path: "/game-death-counter",
		name: "Game Death Counter",
		description:
			"Projet de suivi du nombre de morts dans les jeux de type Souls",
		documentTitle: "Game Death Counter",
		favicon: "/favicon/game-death-counter.ico",
		illustration: "/favicon/game-death-counter.png",
	},

	[ProjectsEnum.Backlog]: {
		id: "backlog",
		path: "/backlog",
		name: "Backlog",
		description: "Projet de suivi du backlog des jeux, films et séries",
		documentTitle: "Backlog",
		favicon: "/favicon/backlog.ico",
		illustration: "/favicon/backlog.png",
	},
	[ProjectsEnum.AngersIrigo]: {
		id: "angersIrigo",
		path: "/angers-irigo",
		name: "Angers Irigo",
		description:
			"Suivi en temps réel des transport en commun de la ville d'Angers",
		documentTitle: "Angers Irigo en Temps réel",
		favicon: "/favicon/angersIrigo.ico",
		illustration: "/favicon/angersIrigo.png",
	},
};
