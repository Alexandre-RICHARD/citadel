import { angersIrigoTheme } from "@citadel/design-system/src/theme/projectThemes/angersIrigoTheme";
import { backlogTheme } from "@citadel/design-system/src/theme/projectThemes/backlogTheme";
import { citadelTheme } from "@citadel/design-system/src/theme/projectThemes/citadelTheme";
import { gameDeathCounterTheme } from "@citadel/design-system/src/theme/projectThemes/gameDeathCounterTheme";
import { satisfactoryTheme } from "@citadel/design-system/src/theme/projectThemes/satisfactoryTheme";

import type { ProjectDictionary } from "./projectDictionary.type";
import { ProjectsEnum } from "./projects.enum";

export const projects: Record<ProjectsEnum, ProjectDictionary> = {
	[ProjectsEnum.Homepage]: {
		id: ProjectsEnum.Homepage,
		path: "/homepage",
		name: "Homepage",
		description: "La page sur laquelle vous vous trouvez",
		documentTitle: "Alexandre Richard",
		favicon: "/favicon/home.ico",
		illustration: "/favicon/home.ico",
		theme: citadelTheme,
	},
	[ProjectsEnum.Satisfactory]: {
		id: ProjectsEnum.Satisfactory,
		path: "/satisfactory",
		name: "Satisfactory",
		description: "Projet en lien avec le jeu éponyme",
		documentTitle: "Satisfactory Calculator",
		favicon: "/favicon/satisfactory.ico",
		illustration: "/favicon/satisfactory.png",
		theme: satisfactoryTheme,
	},
	[ProjectsEnum.GameDeathCount]: {
		id: ProjectsEnum.GameDeathCount,
		path: "/game-death-counter",
		name: "Game Death Counter",
		description:
			"Projet de suivi du nombre de morts dans les jeux de type Souls",
		documentTitle: "Game Death Counter",
		favicon: "/favicon/game-death-counter.ico",
		illustration: "/favicon/game-death-counter.png",
		theme: gameDeathCounterTheme,
	},

	[ProjectsEnum.Backlog]: {
		id: ProjectsEnum.Backlog,
		path: "/backlog",
		name: "Backlog",
		description: "Projet de suivi du backlog des jeux, films et séries",
		documentTitle: "Backlog",
		favicon: "/favicon/backlog.ico",
		illustration: "/favicon/backlog.png",
		theme: backlogTheme,
	},
	[ProjectsEnum.AngersIrigo]: {
		id: ProjectsEnum.AngersIrigo,
		path: "/angers-irigo",
		name: "Angers Irigo",
		description:
			"Suivi en temps réel des transport en commun de la ville d'Angers",
		documentTitle: "Angers Irigo en Temps réel",
		favicon: "/favicon/angersIrigo.ico",
		illustration: "/favicon/angersIrigo.png",
		theme: angersIrigoTheme,
	},
};
