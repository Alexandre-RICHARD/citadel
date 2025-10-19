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
	[ProjectsEnum.TestOne]: {
		path: "/test1",
		name: "Test numéro 1",
		buildPath: "/projects/test_first",
		outputFile: "projects/test1",
		documentTitle: "Test 1",
		favicon: "/favicon/testOne.ico",
	},
	[ProjectsEnum.TestTwo]: {
		path: "/test2",
		name: "Test numéro 2",
		buildPath: "/projects/test_second",
		outputFile: "projects/test2",
		documentTitle: "Test 2",
		favicon: "/favicon/testTwo.ico",
	},
};
