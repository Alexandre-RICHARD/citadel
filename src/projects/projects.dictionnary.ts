import { ProjectsEnum } from "./projects.enum";

type ProjectDictionnary = {
	path: string;
	name: string;
	buildPath: string;
	outputFile: string;
};

export const projects: Record<ProjectsEnum, ProjectDictionnary> = {
	[ProjectsEnum.Homepage]: {
		path: "/",
		name: "Homepage",
		buildPath: "/projects/homepage",
		outputFile: "projects/home",
	},
	[ProjectsEnum.TestOne]: {
		path: "/test1",
		name: "Test numéro 1",
		buildPath: "/projects/test_first",
		outputFile: "projects/test1",
	},
	[ProjectsEnum.TestTwo]: {
		path: "/test2",
		name: "Test numéro 2",
		buildPath: "/projects/test_second",
		outputFile: "projects/test2",
	},
};
