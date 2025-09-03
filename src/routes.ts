import { createBrowserRouter, type RouteObject } from "react-router";

import { Navigation } from "./Navigation";
import { projects } from "./projects/projects.dictionnary";
import { ProjectsEnum } from "./projects/projects.enum";

const routes: Record<ProjectsEnum, RouteObject> = {
	[ProjectsEnum.Homepage]: {
		path: projects[ProjectsEnum.Homepage].path,
		lazy: async () => {
			const { Homepage } = await import("./projects/homepage/index");
			return { Component: Homepage };
		},
		handle: { project: ProjectsEnum.Homepage },
		index: true,
	},
	[ProjectsEnum.TestOne]: {
		path: "/test1",
		lazy: async () => {
			const { FirstTest } = await import("./projects/test_first/index");
			return { Component: FirstTest };
		},
		handle: { project: ProjectsEnum.TestOne },
	},
	[ProjectsEnum.TestTwo]: {
		path: "/test2",
		lazy: async () => {
			const { SecondTest } = await import("./projects/test_second/index");
			return { Component: SecondTest };
		},
		handle: { project: ProjectsEnum.TestTwo },
	},
};

export const router = createBrowserRouter([
	{
		path: "/",
		Component: Navigation,
		children: Object.values(routes),
	},
]);
