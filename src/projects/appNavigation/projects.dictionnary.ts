import type { ProjectDictionnary } from "./projectDictionnary.type";
import { ProjectsEnum } from "./projects.enum";

export const projects: Record<ProjectsEnum, ProjectDictionnary> = {
	[ProjectsEnum.Homepage]: {
		id: "homepage",
		path: "/homepage",
		name: "Homepage",
		description: "La page sur laquelle vous vous trouvez",
		buildPath: "/projects/homepage",
		outputFile: "projects/home",
		documentTitle: "Alexandre Richard",
		favicon: "/favicon/home.ico",
	},
	[ProjectsEnum.Test]: {
		id: "test",
		path: "/test",
		name: "Test",
		description: "Un projet uniquement fait pour tester des features",
		buildPath: "/projects/test",
		outputFile: "projects/test",
		documentTitle: "Test",
		favicon: "/favicon/test.ico",
	},
	[ProjectsEnum.Satisfactory]: {
		id: "satisfactory",
		path: "/satisfactory",
		name: "Satisfactory",
		description: "Projet en lien avec le jeu éponyme",
		buildPath: "/projects/satisfactory",
		outputFile: "projects/satisfactory",
		documentTitle: "Satisfactory Calculator",
		favicon: "/favicon/satisfactory.ico",
	},
};
