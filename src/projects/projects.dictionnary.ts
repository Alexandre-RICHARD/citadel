import { ProjectsEnum } from "./projects.enum";

type ProjectDictionnary = {
	path: string;
	name: string;
	buildPath: string;
	outputFile: string;
	documentTitle: string;
	favicon: string;
};

export const projects: Record<ProjectsEnum, ProjectDictionnary> = {
	[ProjectsEnum.Homepage]: {
		path: "/homepage",
		name: "Homepage",
		buildPath: "/projects/homepage",
		outputFile: "projects/home",
		documentTitle: "Alexandre Richard",
		favicon: "/favicon/home.ico",
	},
	[ProjectsEnum.Test]: {
		path: "/test",
		name: "Test",
		buildPath: "/projects/test",
		outputFile: "projects/test",
		documentTitle: "Test",
		favicon: "/favicon/test.ico",
	},
};
