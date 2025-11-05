import { createBrowserRouter, type RouteObject } from "react-router";

import { projects } from "../projects/projects.dictionnary";
import { ProjectsEnum } from "../projects/projects.enum";
import { Navigation } from "./Navigation";
import type { RouteMeta } from "./routeMeta.type";

const routes: Record<ProjectsEnum, RouteObject> = {
	[ProjectsEnum.Homepage]: {
		path: `${projects[ProjectsEnum.Homepage].path}/*`,
		lazy: async () => {
			const { Homepage } = await import("../projects/homepage/index");
			return { Component: Homepage };
		},
		handle: {
			project: ProjectsEnum.Homepage,
			documentTitle: projects[ProjectsEnum.Homepage].documentTitle,
			favicon: projects[ProjectsEnum.Homepage].favicon,
			basePath: projects[ProjectsEnum.Homepage].path,
		} satisfies RouteMeta,
	},
	[ProjectsEnum.Test]: {
		path: `${projects[ProjectsEnum.Test].path}/*`,
		lazy: async () => {
			const { Test } = await import("../projects/test/index");
			return { Component: Test };
		},
		handle: {
			project: ProjectsEnum.Test,
			documentTitle: projects[ProjectsEnum.Test].documentTitle,
			favicon: projects[ProjectsEnum.Test].favicon,
			basePath: projects[ProjectsEnum.Test].path,
		} satisfies RouteMeta,
		index: true,
	},
};

export const router = createBrowserRouter([
	{
		path: "/",
		Component: Navigation,
		children: Object.values(routes),
	},
]);
