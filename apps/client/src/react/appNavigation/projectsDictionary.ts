import { angersIrigoTheme } from "@citadel/design-system/src/theme/projectThemes/angersIrigoTheme";
import { backlogTheme } from "@citadel/design-system/src/theme/projectThemes/backlogTheme";
import { citadelTheme } from "@citadel/design-system/src/theme/projectThemes/citadelTheme";
import { gameDeathCounterTheme } from "@citadel/design-system/src/theme/projectThemes/gameDeathCounterTheme";
import { satisfactoryTheme } from "@citadel/design-system/src/theme/projectThemes/satisfactoryTheme";

import type { ProjectDictionary } from "./projectDictionary.type";
import { ProjectsEnum } from "./projects.enum";
import { angersIrigoShowcase } from "./showcase/angersIrigoShowcase";
import { backlogShowcase } from "./showcase/backlogShowcase";
import { gameDeathCounterShowcase } from "./showcase/gameDeathCounterShowcase";
import { satisfactoryShowcase } from "./showcase/satisfactoryShowcase";

// La fiche de chaque projet. L'ordre est celui de la roue de la homepage
export const projects: Record<ProjectsEnum, ProjectDictionary> = {
	[ProjectsEnum.Homepage]: {
		id: ProjectsEnum.Homepage,
		path: "/homepage",
		name: "Homepage",
		documentTitle: "La Citadel d’Alex",
		favicon: "/favicon/home.ico",
		illustration: "/favicon/home.ico",
		theme: citadelTheme,
		showcase: null,
	},
	[ProjectsEnum.Satisfactory]: {
		id: ProjectsEnum.Satisfactory,
		path: "/satisfactory",
		name: "Satisfactory",
		documentTitle: "Satisfactory Calculator",
		favicon: "/favicon/satisfactory.ico",
		illustration: "/favicon/satisfactory.png",
		theme: satisfactoryTheme,
		showcase: satisfactoryShowcase,
	},
	[ProjectsEnum.GameDeathCount]: {
		id: ProjectsEnum.GameDeathCount,
		path: "/game-death-counter",
		name: "Game Death Counter",
		documentTitle: "Game Death Counter",
		favicon: "/favicon/game-death-counter.ico",
		illustration: "/favicon/game-death-counter.png",
		theme: gameDeathCounterTheme,
		showcase: gameDeathCounterShowcase,
	},

	[ProjectsEnum.Backlog]: {
		id: ProjectsEnum.Backlog,
		path: "/backlog",
		name: "Backlog",
		documentTitle: "Backlog",
		favicon: "/favicon/backlog.ico",
		illustration: "/favicon/backlog.png",
		theme: backlogTheme,
		showcase: backlogShowcase,
	},
	[ProjectsEnum.AngersIrigo]: {
		id: ProjectsEnum.AngersIrigo,
		path: "/angers-irigo",
		name: "Angers Irigo",
		documentTitle: "Angers Irigo en Temps réel",
		favicon: "/favicon/angersIrigo.ico",
		illustration: "/favicon/angersIrigo.png",
		theme: angersIrigoTheme,
		showcase: angersIrigoShowcase,
	},
};
