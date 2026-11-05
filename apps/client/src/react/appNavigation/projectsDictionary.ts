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
		requiresAccount: false,
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
		requiresAccount: false,
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
		requiresAccount: true,
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
		requiresAccount: true,
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
		requiresAccount: false,
	},
	// Les comptes, partagés par tous les projets : dans l'ambiance de la homepage, ni dans la roue ni dans le pied de page
	[ProjectsEnum.Auth]: {
		id: ProjectsEnum.Auth,
		path: "/auth",
		name: "Compte",
		documentTitle: "Compte · La Citadel d’Alex",
		favicon: "/favicon/home.ico",
		illustration: "/favicon/home.ico",
		theme: citadelTheme,
		showcase: null,
		// Ses pages se gardent chacune : la connexion ne peut pas exiger d'être connecté
		requiresAccount: false,
	},
};
