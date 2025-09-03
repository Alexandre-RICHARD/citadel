import { createBrowserRouter, type RouteObject } from "react-router";

import { projects } from "../projects/projects.dictionnary";
import { ProjectsEnum } from "../projects/projects.enum";
import { Navigation } from "./Navigation";
import type { RouteMeta } from "./routeMeta.type";

const routes: Record<ProjectsEnum, RouteObject> = {
	[ProjectsEnum.Homepage]: {
		path: projects[ProjectsEnum.Homepage].path,
		lazy: async () => {
			const { Homepage } = await import("../projects/homepage/index");
			return { Component: Homepage };
		},
		handle: {
			project: ProjectsEnum.Homepage,
			documentTitle: projects[ProjectsEnum.Homepage].documentTitle,
			favicon: projects[ProjectsEnum.Homepage].favicon,
		} as RouteMeta,
		index: true,
	},
	[ProjectsEnum.TestOne]: {
		path: "/test1",
		lazy: async () => {
			const { FirstTest } = await import("../projects/test_first/index");
			return { Component: FirstTest };
		},
		handle: {
			project: ProjectsEnum.TestOne,
			documentTitle: projects[ProjectsEnum.TestOne].documentTitle,
			favicon: projects[ProjectsEnum.TestOne].favicon,
		} as RouteMeta,
	},
	[ProjectsEnum.TestTwo]: {
		path: "/test2",
		lazy: async () => {
			const { SecondTest } = await import("../projects/test_second/index");
			return { Component: SecondTest };
		},
		handle: {
			project: ProjectsEnum.TestTwo,
			documentTitle: projects[ProjectsEnum.TestTwo].documentTitle,
			favicon: projects[ProjectsEnum.TestTwo].favicon,
		} as RouteMeta,
	},
};

export const router = createBrowserRouter([
	{
		path: "/",
		Component: Navigation,
		children: Object.values(routes),
	},
]);
