import type { NavigationItems } from "./navigationItems.type";

export const navigationGroups: NavigationItems = [
	{
		naviItem: [
			{
				label: "homepage",
				link: "/satisfactory",
			},
			{
				label: "recipes",
				link: "/satisfactory/recipes",
			},
			{
				label: "calculator",
				link: "/satisfactory/calculator",
			},
			{
				label: "machines",
				link: "/satisfactory/frm/allMachines",
			},
		],
	},
	{
		naviItem: [
			{
				label: "settings",
				link: "/satisfactory/settings",
			},
			{
				label: "Retour en page d'accueil",
				link: "/",
			},
		],
	},
] as const;
