import { createBrowserRouter, redirect, type RouteObject } from "react-router";

import { projectLoaders } from "./projectLoaders";
import { ProjectsEnum } from "./projects.enum";
import { projects } from "./projectsDictionary";
import type { RouteMeta } from "./routeMeta.type";

const routes: Record<ProjectsEnum, RouteObject> = {
	[ProjectsEnum.Homepage]: {
		path: `${projects[ProjectsEnum.Homepage].path}/*`,
		lazy: async () => {
			const { Homepage } = await projectLoaders[ProjectsEnum.Homepage]();
			return { Component: Homepage };
		},
		handle: {
			project: ProjectsEnum.Homepage,
			documentTitle: projects[ProjectsEnum.Homepage].documentTitle,
			favicon: projects[ProjectsEnum.Homepage].favicon,
			basePath: projects[ProjectsEnum.Homepage].path,
		} satisfies RouteMeta,
	},
	[ProjectsEnum.Satisfactory]: {
		path: `${projects[ProjectsEnum.Satisfactory].path}/*`,
		lazy: async () => {
			const { Satisfactory } =
				await projectLoaders[ProjectsEnum.Satisfactory]();
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
			const { GameDeathCounter } =
				await projectLoaders[ProjectsEnum.GameDeathCount]();
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
	[ProjectsEnum.Backlog]: {
		path: `${projects[ProjectsEnum.Backlog].path}/*`,
		lazy: async () => {
			const { Backlog } = await projectLoaders[ProjectsEnum.Backlog]();
			return { Component: Backlog };
		},
		handle: {
			project: ProjectsEnum.Backlog,
			documentTitle: projects[ProjectsEnum.Backlog].documentTitle,
			favicon: projects[ProjectsEnum.Backlog].favicon,
			basePath: projects[ProjectsEnum.Backlog].path,
		} satisfies RouteMeta,
		index: true,
	},
	[ProjectsEnum.AngersIrigo]: {
		path: `${projects[ProjectsEnum.AngersIrigo].path}/*`,
		lazy: async () => {
			const { AngersIrigo } = await projectLoaders[ProjectsEnum.AngersIrigo]();
			return { Component: AngersIrigo };
		},
		handle: {
			project: ProjectsEnum.AngersIrigo,
			documentTitle: projects[ProjectsEnum.AngersIrigo].documentTitle,
			favicon: projects[ProjectsEnum.AngersIrigo].favicon,
			basePath: projects[ProjectsEnum.AngersIrigo].path,
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
