import { createBrowserRouter, redirect, type RouteObject } from "react-router";

import { projects } from "./projects.dictionnary";
import { ProjectsEnum } from "./projects.enum";
import type { RouteMeta } from "./routeMeta.type";

const routes: Record<ProjectsEnum, RouteObject> = {
	[ProjectsEnum.Homepage]: {
		path: `${projects[ProjectsEnum.Homepage].path}/*`,
		lazy: async () => {
			const { Homepage } = await import("../../projects/Homepage");
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
			const { Test } = await import("../../projects/Test");
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
	[ProjectsEnum.Satisfactory]: {
		path: `${projects[ProjectsEnum.Satisfactory].path}/*`,
		lazy: async () => {
			const { Satisfactory } = await import("../../projects/Satisfactory");
			return { Component: Satisfactory };
		},
		handle: {
			project: ProjectsEnum.Satisfactory,
			documentTitle: projects[ProjectsEnum.Satisfactory].documentTitle,
			favicon: projects[ProjectsEnum.Satisfactory].favicon,
			basePath: projects[ProjectsEnum.Satisfactory].path,
		} satisfies RouteMeta,
		index: true,
	},
	[ProjectsEnum.GameDeathCount]: {
		path: `${projects[ProjectsEnum.GameDeathCount].path}/*`,
		lazy: async () => {
			const { GameDeathCounter } = await import(
				"../../projects/GameDeathCounter"
			);
			return { Component: GameDeathCounter };
		},
		handle: {
			project: ProjectsEnum.GameDeathCount,
			documentTitle: projects[ProjectsEnum.GameDeathCount].documentTitle,
			favicon: projects[ProjectsEnum.GameDeathCount].favicon,
			basePath: projects[ProjectsEnum.GameDeathCount].path,
		} satisfies RouteMeta,
		index: true,
	},
};

export const router = createBrowserRouter([
	{
		path: "/",
		children: [
			{
				index: true,
				loader() {
					return redirect(projects[ProjectsEnum.Homepage].path);
				},
			},
			...Object.values(routes),
		],
	},
]);
